def serialize_metric(metric: dict) -> dict | None:
    """
    Serialize a single metric.

    Args:
        metric: The metric to serialize

    Returns: The serialized metric or None if the metric passed in is None
    """
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
    } if metric else None


def serialize_metrics(metrics: list[dict]) -> list[dict]:
    """
    Serialize a list of metrics.

    Args:
        metrics: The list of metrics to serialize

    Returns: The serialized list of metrics
    """
    return [serialize_metric(metrics) for metrics in metrics if metrics]
