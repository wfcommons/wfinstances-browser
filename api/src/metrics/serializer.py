def serialize_metric(metric: dict) -> dict:
    return {
        'id': metric.get('_id'),
        'githubRepo': metric.get('_githubRepo'),
        'numTasks': metric.get('numTasks'),
        'numFiles': metric.get('numFiles'),
        'totalBytesRead': metric.get('totalBytesRead'),
        'totalBytesWritten': metric.get('totalBytesWritten'),
        'work': metric.get('work'),
        'depth': metric.get('depth'),
        'minWidth': metric.get('minWidth'),
        'maxWidth': metric.get('maxWidth')
    }


def serialize_metrics(metrics: list[dict]) -> list[dict]:
    return [serialize_metric(metrics) for metrics in metrics]
