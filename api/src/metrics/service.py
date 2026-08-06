import requests
from collections import Counter, defaultdict, deque
from src.database import metrics_collection
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
    logger.info(f"Updating instances...")


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

    logger.info(f"Update of instances complete")


    return valid_wf_instances, invalid_wf_instances


def _generate_metrics(wf_instance: dict) -> dict:
    """
    Generate the num_tasks, num_files, total_bytes_read, total_bytes_written, depth, min_width, max_width metrics.

    Args:
        wf_instance: The WfInstance to generate metrics on

    Returns: The metrics generated using the list and graph data structures
    """
    if "execution" in wf_instance['workflow']:
        execution_metrics = _generate_execution_metrics(wf_instance['workflow']['execution'])
    else:
        execution_metrics = {}

    specification_metrics = _generate_specification_metrics(wf_instance['workflow']['specification'])
    return execution_metrics | specification_metrics


def _generate_execution_metrics(execution: dict) -> dict:
    """
    Generate the total_runtime_in_seconds, total_read_bytes, total_written_bytes metrics.

    Args:
        execution: The execution property of a WfInstance

    Returns: The metrics generated using the list data structure
    """

    total_runtime_in_seconds = 0
    try:
        total_runtime_in_seconds = execution["metrics"]["sumTaskRuntimesInSeconds"]
    except KeyError:
        total_runtime_in_seconds = sum(
            task.get("runtimeInSeconds", 0)
            for task in execution["tasks"]
        )

    total_read_bytes = 0
    try:
        total_read_bytes = execution["metrics"]["totalNumBytesRead"]
    except KeyError:
        total_read_bytes = sum(
            task.get("readBytes", 0)
            for task in execution["tasks"]
        )

    total_written_bytes = 0
    try:
        total_written_bytes = execution["metrics"]["totalNumBytesWritten"]
    except KeyError:
        total_written_bytes = sum(
            task.get("writtenBytes", 0)
            for task in execution["tasks"]
        )

    return {
        'totalReadBytes': total_read_bytes,
        'totalWrittenBytes': total_written_bytes,
        'totalRuntimeInSeconds': total_runtime_in_seconds,
    }

def _compute_graph_metrics(tasks):
    """
    Compute workflow DAG level metrics.

    A root is at level 0. Every other task is at one plus the
    maximum level of any of its parents.

    Returns:
        tuple:
            number_of_levels,
            minimum_level_width,
            maximum_level_width
    """
    number_of_tasks = len(tasks)

    # Explicit behavior for an empty workflow.
    if number_of_tasks == 0:
        return 0, 0, 0

    # Mapping IDs to integer indices lets the frequently updated state
    # below use compact Python lists rather than dictionaries keyed by
    # task-ID strings.
    id_to_index = {}

    for index, task in enumerate(tasks):
        task_id = task["id"]

        if task_id in id_to_index:
            raise ValueError(f"Duplicate task ID: {task_id!r}")

        id_to_index[task_id] = index

    # This assumes the parents and children declarations agree, as they
    # should in a valid WfFormat instance.
    remaining_parents = [
        len(task["parents"])
        for task in tasks
    ]

    ready = deque(
        index
        for index, parent_count in enumerate(remaining_parents)
        if parent_count == 0
    )

    level_widths = []
    number_processed = 0

    while ready:
        # Tasks currently in the queue constitute exactly one level.
        level_width = len(ready)
        level_widths.append(level_width)

        # Fix the iteration count so that children made ready during
        # this iteration are processed as part of the next level.
        for _ in range(level_width):
            task_index = ready.popleft()
            task = tasks[task_index]
            number_processed += 1

            for child_id in task["children"]:
                try:
                    child_index = id_to_index[child_id]
                except KeyError as exc:
                    raise ValueError(
                        f"Task {task['id']!r} references unknown "
                        f"child task {child_id!r}"
                    ) from exc

                remaining_parents[child_index] -= 1

                if remaining_parents[child_index] == 0:
                    ready.append(child_index)
                elif remaining_parents[child_index] < 0:
                    raise ValueError(
                        "Inconsistent parent/child declarations or "
                        f"duplicate edge ending at task {child_id!r}"
                    )

    if number_processed != number_of_tasks:
        unresolved = [
            tasks[index]["id"]
            for index, parent_count in enumerate(remaining_parents)
            if parent_count > 0
        ]

        preview = ", ".join(repr(task_id) for task_id in unresolved[:5])

        raise ValueError(
            "The workflow graph contains a cycle or has inconsistent "
            f"parent/child declarations; {len(unresolved)} tasks were "
            f"not processed"
            + (f" ({preview})" if preview else "")
        )

    return (
        len(level_widths),
        min(level_widths),
        max(level_widths),
    )


def _generate_specification_metrics(specification: dict) -> dict:
    """
    Generate the num_tasks, num_files, depth, min_width, max_width, sum_file_sizes metrics.

    Args:
        specification: The specification property of a WfInstance

    Returns: The metrics generated using the graph data structure
    """

    # Calculate the sum of file sum_file_sizes (in bytes)
    sum_file_sizes = 0
    try:
        sum_file_sizes = specification["metrics"]["sumOfFileSizesInBytes"]
    except KeyError:
        sum_file_sizes = sum(
            file.get("sizeInBytes", 0)
            for file in specification["files"]
        )

    logger = logging.getLogger("uvicorn.error")
    # Calculate depth, min_width, and max_width only if needed
    try:
        depth = specification["metrics"]["numberOfLevels"]
        min_width = specification["metrics"]["minimumWidth"]
        max_width = specification["metrics"]["maximumWidth"]
        logger.info("Successfully acquired depth/min_width/max_width metrics from the instance itself")
    except KeyError:
        logger.info("Computing depth/min_width/max_width metrics, which can take a while ")
        depth, min_width, max_width = _compute_graph_metrics(specification["tasks"])

    return {
        'numTasks': len(specification['tasks']),
        'numFiles': len(specification['files']),
        'sumFileSizes': sum_file_sizes,
        'depth': depth,
        'minWidth': min_width,
        'maxWidth': max_width
    }
