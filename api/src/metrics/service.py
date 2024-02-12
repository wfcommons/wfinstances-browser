from collections import Counter, defaultdict, deque
from datetime import timedelta
from src.metrics.graph import Graph


def generate_metrics(wf_instance: dict) -> dict:
    tasks = wf_instance['workflow']['tasks']
    return _generate_list_metrics(tasks) | _generate_graph_metrics(tasks)


def _generate_list_metrics(tasks: list[dict]) -> dict:
    files, total_bytes_read, total_bytes_written, work = set(), 0, 0, 0

    for task in tasks:
        if 'files' in task:
            files.update(list(map(lambda file: file['name'], task['files'])))
        work += task.get('runtimeInSeconds', 0)
        total_bytes_read += task.get('bytesRead', 0)
        total_bytes_written += task.get('bytesWritten', 0)

    return {
        'numTasks': len(tasks),
        'numFiles': len(files),
        'totalBytesRead': _get_bytes_string(total_bytes_read),
        'totalBytesWritten': _get_bytes_string(total_bytes_written),
        'work': _get_time_string(work),
    }


def _generate_graph_metrics(tasks: list[dict]) -> dict:
    # Build graph of tasks and files
    graph = Graph()
    for index, task in enumerate(tasks):
        task_name = f'task{str(index)}:{task["name"]}'
        graph.add_node(task_name)

        for file in task['files']:
            file_name = f'file:{file.get("path", "")}{file["name"]}'
            if file['link'] == 'input':
                graph.add_edge(file_name, task_name)
            elif file['link'] == 'output':
                graph.add_edge(task_name, file_name)

    # Build graph of only tasks
    task_graph = Graph()
    all_children = set()
    for node in list(graph.adj_dict.keys()):
        if str.startswith(node, 'file:'):
            continue
        for file_node in graph.adj_dict[node]:
            for task_node in graph.adj_dict[file_node]:
                task_graph.add_edge(node, task_node)
                all_children.add(task_node)

    # Find top-level nodes
    all_nodes = set(graph.adj_dict.keys())
    top_level_nodes = list(all_nodes.difference(all_children))

    # Calculate levels and depth
    depth, levels = 0, defaultdict(int)
    for node in top_level_nodes:
        queue = deque([node])
        while queue:
            task = queue.popleft()
            for child_node in task_graph.adj_dict[task]:
                levels[child_node] = max(1 + levels[task], levels[child_node])
                queue.append(child_node)
                depth = max(depth, levels[child_node])
    depth += 1

    # Calculate min and max width from levels
    counter = Counter()
    for level in levels.values():
        counter[level] += 1
    min_width, max_width = counter.most_common()[-1][1], counter.most_common()[0][1]

    return {
        'depth': depth,
        'minWidth': min_width,
        'maxWidth': max_width
    }


def _get_bytes_string(size: int | float) -> str:
    for unit in ['KB', 'MB', 'GB']:
        size = size / 1000
        if size < 1000:
            return '{0:.2f} {1}'.format(size, unit)


def _get_time_string(seconds: int | float) -> str:
    td = str(timedelta(seconds=seconds))
    if 'day' in td:
        days = td.split(' ')[0]
        hours, minutes, seconds = td.split(', ')[1].split(':')
        return f'{days}d{hours}h{minutes}m{int(float(seconds)):02d}s'
    else:
        hours, minutes, seconds = td.split(':')
        return f'0d{hours}h{minutes}m{int(float(seconds)):02d}s'
