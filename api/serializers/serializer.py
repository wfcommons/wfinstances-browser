def serialize_wf_instance(wf_instance) -> dict:
    return {
        'name': wf_instance['name'],
        'description': wf_instance['description'],
        'createdAt': wf_instance['createdAt'],
        'schemaVersion': wf_instance['schemaVersion'],
        'wms': wf_instance['wms'],
        'author': wf_instance['author'],
        'workflow': wf_instance['workflow']
    }


def serialize_wf_instance_metrics(wf_instance_metrics) -> dict:
    return {
        'id': wf_instance_metrics['_id'],
        'githubRepo': wf_instance_metrics['_githubRepo'],
        'tasks': wf_instance_metrics['tasks']
    }


def serialize_wf_instances_metrics(wf_instances_metrics) -> list:
    return [serialize_wf_instance_metrics(wf_instances_metrics) for wf_instances_metrics in wf_instances_metrics]
