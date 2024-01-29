import re
from collections import Counter, defaultdict, deque
from datetime import timedelta
from src.metrics.graph import Graph


def generate_metrics(wf_instance):
    tasks = wf_instance['workflow']['tasks']
    num_tasks, num_files, total_bytes_read, total_bytes_written, work = generate_list_metrics(tasks)
    depth, min_width, max_width = generate_graph_metrics(tasks)

    return {
        'numTasks': num_tasks,
        'numFiles': num_files,
        'totalBytesRead': get_bytes_string(total_bytes_read),
        'totalBytesWritten': get_bytes_string(total_bytes_read),
        'work': get_time_string(work),
        'depth': depth,
        'minWidth': min_width,
        'maxWidth': max_width
    }


def generate_list_metrics(tasks):
    files, total_bytes_read, total_bytes_written, work = set(), 0, 0, 0

    for task in tasks:
        if 'files' in task:
            files.update(list(map(lambda file: file['name'], task['files'])))
        work += task.get('runtimeInSeconds', 0)
        total_bytes_read += task.get('bytesRead', 0)
        total_bytes_written += task.get('bytesWritten', 0)

    return len(tasks), len(files), total_bytes_read, total_bytes_written, work


def generate_graph_metrics(tasks):
    # Build graph
    tasks_graph, input_tasks = Graph(), []
    for task in tasks:
        if len(task['parents']) == 0:
            input_tasks.append(task['name'])
        for parent in task['parents']:
            tasks_graph.add_edge(parent, task['name'])

    # Build graph from files if parents are non-existent
    if len(tasks) == len(input_tasks):
        tasks_graph, input_tasks = Graph(), []
        input_files, output_files = {}, {}
        for index, task in enumerate(tasks):
            num_input = 0
            for file in task['files']:
                if file['link'] == 'input':
                    input_files[file['name']] = task['name'] + str(index)
                    num_input += 1
                elif file['link'] == 'output':
                    output_files[file['name']] = task['name'] + str(index)
            if num_input == 0:
                input_tasks.append(task['name'] + str(index))

        for key in list(input_files.keys()):
            if key in output_files:
                tasks_graph.add_edge(output_files[key], input_files[key])

    # Calculate levels and depth
    depth, levels = 0, defaultdict(int)
    for input_task in input_tasks:
        queue = deque([input_task])

        while queue:
            task = queue.popleft()
            for child_task in tasks_graph.graph[task]:
                levels[child_task] = max(1 + levels[task], levels[child_task])
                queue.append(child_task)
                depth = max(depth, levels[child_task])
    depth += 1

    # Calculate min and max width from levels
    counter = Counter()
    for level in levels.values():
        counter[level] += 1
    min_width, max_width = counter.most_common()[-1][1], counter.most_common()[0][1]

    return depth, min_width, max_width


def get_bytes_string(size):
    for unit in ['KB', 'MB', 'GB']:
        size = size / 1000
        if size < 1000:
            return '{0:.2f} {1}'.format(size, unit)


def get_time_string(seconds):
    td = str(timedelta(seconds=seconds)).split(':')
    return f'{td[0]}h{td[1]}m{float(td[2]):.0f}s'
