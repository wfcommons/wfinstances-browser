from collections import Counter, defaultdict, deque
from src.metrics.graph import Graph


def generate_metrics(wf_instance: dict) -> dict:
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
    Generate the total_runtime_in_seconds, total_bytes_read, total_bytes_written metrics.

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
    Generate the num_tasks, num_files, depth, min_width, max_width metrics.

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

    return {
        'numTasks': len(specification['tasks']),
        'numFiles': len(specification['files']),
        'depth': depth,
        'minWidth': min_width,
        'maxWidth': max_width
    }
