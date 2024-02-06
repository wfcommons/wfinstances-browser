def serialize_wf_instance(wf_instance) -> dict:
    return {
        'name': wf_instance.get('name'),
        'description': wf_instance.get('description', ''),
        'createdAt': wf_instance.get('createdAt', ''),
        'schemaVersion': wf_instance.get('schemaVersion'),
        'wms': wf_instance.get('wms', None),
        'author': wf_instance.get('author', None),
        'workflow': wf_instance.get('workflow')
    }


def serialize_wf_instances(wf_instances) -> list:
    return [serialize_wf_instance(wf_instances) for wf_instances in wf_instances]
