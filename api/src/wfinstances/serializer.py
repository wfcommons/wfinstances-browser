def serialize_wf_instance(wf_instance: dict) -> dict | None:
    return {
        'id': wf_instance.get('_id'),
        'name': wf_instance.get('name'),
        'description': wf_instance.get('description', ''),
        'createdAt': wf_instance.get('createdAt', ''),
        'schemaVersion': wf_instance.get('schemaVersion'),
        'wms': wf_instance.get('wms', None),
        'author': wf_instance.get('author', None),
        'workflow': wf_instance.get('workflow')
    } if wf_instance else None


def serialize_wf_instances(wf_instances: list[dict]) -> list[dict]:
    return [serialize_wf_instance(wf_instances) for wf_instances in wf_instances if wf_instances]
