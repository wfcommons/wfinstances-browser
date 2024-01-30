def serialize_wf_instance_metrics(wf_instance_metrics) -> dict:
    return {
        'id': wf_instance_metrics.get('_id'),
        'githubRepo': wf_instance_metrics.get('_githubRepo'),
        'numTasks': wf_instance_metrics.get('numTasks'),
        'numFiles': wf_instance_metrics.get('numFiles'),
        'totalBytesRead': wf_instance_metrics.get('totalBytesRead'),
        'totalBytesWritten': wf_instance_metrics.get('totalBytesWritten'),
        'work': wf_instance_metrics.get('work'),
        'depth': wf_instance_metrics.get('depth'),
        'minWidth': wf_instance_metrics.get('minWidth'),
        'maxWidth': wf_instance_metrics.get('maxWidth')
    }


def serialize_wf_instances_metrics(wf_instances_metrics) -> list:
    return [serialize_wf_instance_metrics(wf_instances_metrics) for wf_instances_metrics in wf_instances_metrics]
