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
        'downloadUrl': metric.get('_downloadUrl'),
        'numTasks': metric.get('numTasks'),
        'numFiles': metric.get('numFiles'),
        'totalReadBytes': metric.get('totalReadBytes'),
        'totalWrittenBytes': metric.get('totalWrittenBytes'),
        'totalRuntimeInSeconds': metric.get('totalRuntimeInSeconds'),
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
    return [serialize_metric(metric) for metric in metrics if metric]
