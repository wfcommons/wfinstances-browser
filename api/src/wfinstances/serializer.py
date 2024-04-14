def serialize_wf_instance(wf_instance: dict) -> dict | None:
    """
    Serialize a single WfInstance.

    Args:
        wf_instance: The WfInstance to serialize

    Returns: The serialized WfInstance or None if the WfInstance passed in is None
    """
    return {
        'id': wf_instance.get('_id'),
        'name': wf_instance.get('name'),
        'description': wf_instance.get('description', ''),
        'createdAt': wf_instance.get('createdAt', ''),
        'schemaVersion': wf_instance.get('schemaVersion'),
        'author': wf_instance.get('author', ''),
        'workflow': wf_instance.get('workflow')
    } if wf_instance else None


def serialize_wf_instances(wf_instances: list[dict]) -> list[dict]:
    """
    Serialize a list of WfInstances.

    Args:
        wf_instances: The list of WfInstances to serialize

    Returns: The serialized list of WfInstances
    """
    return [serialize_wf_instance(wf_instances) for wf_instances in wf_instances if wf_instances]
