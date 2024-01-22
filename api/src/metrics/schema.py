def serialize_wf_instance_metrics(wf_instance_metrics) -> dict:
    return {
        'id': wf_instance_metrics['_id'],
        'githubRepo': wf_instance_metrics['_githubRepo'],
        'tasks': wf_instance_metrics['tasks']
    }


def serialize_wf_instances_metrics(wf_instances_metrics) -> list:
    return [serialize_wf_instance_metrics(wf_instances_metrics) for wf_instances_metrics in wf_instances_metrics]
