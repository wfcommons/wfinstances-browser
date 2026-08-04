import requests
from collections import Counter, defaultdict, deque
from src.database import metrics_collection
from src.metrics.graph import Graph
from src.exceptions import InvalidWfInstanceException, GithubResourceNotFoundException
from src.wfinstances.service import validate_wf_instance
import sys
import os
import json
import time
import git
from pathlib import Path
import logging


def insert_metrics_from_github(owner: str, repo_name: str) -> tuple[list, list]:
    """
    Insert WfInstances and generate their metrics from a GitHub repository into the MongoDB collections.

    Args:
        owner: The owner of the GitHub repository
        repo_name: The name of the GitHub repository

    Raises:
        HTTPException: GitHub repository does not exist

    Returns: Valid and invalid JSON filenames that match and mismatches the WfInstance schema
    """
    valid_wf_instances, invalid_wf_instances = [], []

    # Set up the repository URL and local directory
    repo_url = f"https://github.com/{owner}/{repo_name}.git"
    local_dir = Path(f"/data/github/{repo_name}")

    git_dir = local_dir / ".git"
    new_clone = not git_dir.is_dir()

    logger = logging.getLogger("uvicorn.error")

    # Clone the repository if it doesn't exist locally
    if new_clone:
        logger.info(f"Cloning repository {repo_url} into {local_dir}...")
        git_repo = git.Repo.clone_from(repo_url, local_dir)

        # A new clone has no previous local revision, so examine every JSON file.
        json_files_to_process = {
            path
            for path in local_dir.rglob("*")
            if path.is_file()
            and path.suffix.lower() == ".json"
            and ".git" not in path.parts
        }

    else:
        logger.info(f"Repository already exists locally. Pulling the latest changes...")
        git_repo = git.Repo(local_dir)

        if git_repo.is_dirty(untracked_files=True):
                raise RuntimeError(
                    f"Repository {local_dir} contains local modifications. "
                    "Refusing to pull because change detection would be ambiguous."
                )

        old_commit = git_repo.head.commit.hexsha
        # --ff-only prevents an unexpected local merge commit.
        git_repo.git.pull("--ff-only")

        new_commit = git_repo.head.commit.hexsha

        logger.info(f"Previous commit: {old_commit}")
        logger.info(f"Current commit:  {new_commit}")
        logger.info(git_repo.git.diff("--name-status", old_commit, new_commit))

        json_files_to_process = set()

        if old_commit != new_commit:
            # --no-renames makes a rename appear as a deletion plus an addition.
            # Therefore, the file at its new path will be processed.
            changed_paths = git_repo.git.diff(
                "--name-only",
                "--diff-filter=AM",
                "--no-renames",
                old_commit,
                new_commit,
            ).splitlines()

            for relative_name in changed_paths:
                path = local_dir / relative_name

                if path.is_file() and path.suffix.lower() == ".json":
                    json_files_to_process.add(path)

    logger.info(f"Need to update {len(json_files_to_process)} files")

    for file_path in sorted(json_files_to_process):
        logger.info(f"Inspecting updated file {file_path}")

        # Read the JSON file
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                wf_instance = json.load(f)
        except json.JSONDecodeError:
            logger.info(f"Invalid JSON format: {file_path}")
            invalid_wf_instances.append(file_path.name)
            continue

        # Validate the WfInstance schema
        try:
            validate_wf_instance(wf_instance)
        except InvalidWfInstanceException:
            invalid_wf_instances.append(file_path.name)
            continue

        valid_wf_instances.append(file_path.name)

        # Generate metrics and store them in the database
        metrics = _generate_metrics(wf_instance)
        metrics["_id"] = file_path.name
        metrics["_githubRepo"] = f"{owner}/{repo_name}"
        metrics["_filePath"] = str(file_path)
        metrics_collection.find_one_and_update(
            {"_id": metrics["_id"]},
            {"$set": metrics},
            upsert=True,
        )
        logger.info(f"Processed file {file_path}")

    return valid_wf_instances, invalid_wf_instances


def _generate_metrics(wf_instance: dict) -> dict:
    """
    Generate the num_tasks, num_files, total_bytes_read, total_bytes_written, depth, min_width, max_width metrics.

    Args:
        wf_instance: The WfInstance to generate metrics on

    Returns: The metrics generated using the list and graph data structures
    """
    execution = wf_instance['workflow']['execution']
    specification = wf_instance['workflow']['specification']
    return _generate_execution_metrics(execution) | _generate_specification_metrics(specification)


def _generate_execution_metrics(execution: dict) -> dict:
    """
    Generate the total_runtime_in_seconds, total_read_bytes, total_written_bytes metrics.

    Args:
        execution: The execution property of a WfInstance

    Returns: The metrics generated using the list data structure
    """
    total_runtime_in_seconds, total_read_bytes, total_written_bytes = 0, 0, 0

    for task in execution['tasks']:
        total_runtime_in_seconds += task.get('runtimeInSeconds', 0)
        total_read_bytes += task.get('readBytes', 0)
        total_written_bytes += task.get('writtenBytes', 0)

    return {
        'totalReadBytes': total_read_bytes,
        'totalWrittenBytes': total_written_bytes,
        'totalRuntimeInSeconds': total_runtime_in_seconds,
    }


def _generate_specification_metrics(specification: dict) -> dict:
    """
    Generate the num_tasks, num_files, depth, min_width, max_width, sum_file_sizes metrics.

    Args:
        specification: The specification property of a WfInstance

    Returns: The metrics generated using the graph data structure
    """
    # Build graph of tasks
    graph, top_level_nodes = Graph(), set()
    for task in specification['tasks']:
        if len(task['parents']) == 0:
            top_level_nodes.add(task['id'])
        for child in task['children']:
            graph.add_edge(task['id'], child)

    # Calculate levels and depth
    depth, levels = 0, defaultdict(int)
    for node in top_level_nodes:
        queue = deque([node])
        while queue:
            task = queue.popleft()
            for child_node in graph.adj_dict[task]:
                levels[child_node] = max(1 + levels[task], levels[child_node])
                queue.append(child_node)
                depth = max(depth, levels[child_node])
    depth += 1

    # Calculate min and max width from levels
    counter = Counter()
    for level in levels.values():
        counter[level] += 1
    most_common = counter.most_common()
    min_width, max_width = most_common[-1][1], most_common[0][1]

    # Calculate the sum of file sum_file_sizes (in bytes)
    sum_file_sizes = 0
    for file in specification['files']:
        #sys.stderr.write(f"FILE: {file["id"]} : {file['sizeInBytes']}\n")
        sum_file_sizes += file.get('sizeInBytes', 0)
    #sys.stderr.write(f"TOTAL SIZE: {sum_file_sizes}")


    return {
        'numTasks': len(specification['tasks']),
        'numFiles': len(specification['files']),
        'sumFileSizes': sum_file_sizes,
        'depth': depth,
        'minWidth': min_width,
        'maxWidth': max_width
    }
