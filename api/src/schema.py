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


def serialize_wf_instances(wf_instances) -> list:
    return [serialize_wf_instance(wf_instances) for wf_instances in wf_instances]
