import requests
from collections import Counter, defaultdict, deque
from src.database import metrics_collection
from src.metrics.graph import Graph
from src.exceptions import InvalidWfInstanceException, GithubResourceNotFoundException
from src.wfinstances.service import validate_wf_instance
import sys


def insert_metrics_from_github(owner: str, repo: str) -> tuple[list, list]:
    """
    Insert WfInstances and generate their metrics from a GitHub repository into the MongoDB collections.

    Args:
        owner: The owner of the GitHub repository
        repo: The name of the GitHub repository

    Raises:
        HTTPException: GitHub repository does not exist

    Returns: Valid and invalid JSON filenames that match and mismatches the WfInstance schema
    """
    valid_wf_instances, invalid_wf_instances = [], []

    def recurse_dir(path='') -> None:
        response = requests.get(f'https://api.github.com/repos/{owner}/{repo}/contents/{path}')
        if response.status_code != 200:
            raise GithubResourceNotFoundException('repository')
        files = response.json()

        for file in files:
            if file['type'] == 'dir':
                recurse_dir(file['path'])
            elif str.endswith(file['name'], '.json'):
                sys.stderr.write(f"Inspecting file {file['name']}\n")
                response = requests.get(file['download_url'])
                if response.status_code != 200:
                    raise GithubResourceNotFoundException('download_url')
                wf_instance = response.json()

                try:
                    validate_wf_instance(wf_instance)
                except InvalidWfInstanceException:
                    invalid_wf_instances.append(file['name'])
                    continue

                valid_wf_instances.append(file['name'])

                # Replace if already exists, otherwise add into metrics_collection
                metrics = _generate_metrics(wf_instance)
                metrics['_id'] = file['name']
                metrics['_githubRepo'] = f'{owner}/{repo}'
                metrics['_downloadUrl'] = file['download_url']
                metrics_collection.find_one_and_update(
                    {'_id': metrics['_id']},
                    {'$set': metrics},
                    upsert=True)

    recurse_dir()
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
