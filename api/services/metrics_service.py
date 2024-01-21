from datetime import timedelta


def generate_metrics(wf_instance):
    return {
        'tasks': generate_task_metrics(wf_instance)
    }


def generate_task_metrics(wf_instance):
    tasks = wf_instance['workflow']['tasks']

    num_tasks = len(tasks)
    work, files, footprint = 0, set(), 0
    for task in tasks:
        work += task['runtimeInSeconds']
        files.update(list(map(lambda file: file['name'], task['files'])))
        footprint += abs(task.get('bytesWritten', 0) - task.get('bytesRead', 0))

    return {
        'numTasks': num_tasks,
        'work': get_time_string(work),
        'numFiles': len(files),
        'footprint': get_bytes_string(footprint)
    }


def get_time_string(seconds):
    td = str(timedelta(seconds=seconds)).split(':')
    return f'{td[0]}h{td[1]}m{float(td[2]):.0f}s'


def get_bytes_string(size):
    for unit in ['KB', 'MB', 'GB']:
        size = size / 1000
        if size < 1000:
            return '{0:.2f} {1}'.format(size, unit)
