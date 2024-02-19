import json
from fastapi import APIRouter, UploadFile
from src.database import wf_instance_collection, metrics_collection
from src.models import ApiResponse
from src.wfinstances.serializer import serialize_wf_instance, serialize_wf_instances
from src.wfinstances.service import insert_wf_instance, insert_wf_instances_from_github

router = APIRouter()


@router.post('/', response_model=ApiResponse)
async def get_wf_instances(ids: list[str]) -> dict[str, list[dict]]:
    """
    Get a list of WfInstances.

    - **Request body**: List of ids to retrieve, usually stored in the collection as a filename that ends in .json
    """
    wf_instances = serialize_wf_instances(wf_instance_collection.find({'_id': {'$in': ids}}))
    return {
        'detail': ('WfInstances retrieved.'
                   if len(ids) == len(wf_instances) else
                   'Some or all of the WfInstances were not retrieved.'),
        'result': wf_instances
    }


@router.delete('/', response_model=ApiResponse)
async def delete_wf_instances(ids: list[str]) -> dict[str, str]:
    """
    Delete WfInstances and their associated metrics.

    - **Request body**: List of ids to delete, usually stored in the collection as a filename that ends in .json
    """
    wf_instance_collection.delete({'_id': {'$in': ids}})
    metrics_collection.delete({'_id': {'$in': ids}})
    return {
        'detail': 'The WfInstances were deleted successfully.',
        'result': ids
    }


@router.delete('/{id}', response_model=ApiResponse)
async def delete_wf_instance(id: str) -> dict[str, str]:
    """
    Delete a single WfInstance and its associated metrics.

    - **id**: The id to delete, usually stored in the collection as a filename that ends in .json
    """
    wf_instance_collection.delete_one({'_id': id})
    metrics_collection.delete_one({'_id': id})
    return {
        'detail': 'The WfInstance was deleted successfully.',
        'result': id
    }


@router.get('/{id}', response_model=ApiResponse)
async def get_wf_instance(id: str) -> dict[str, dict]:
    """
    Get a single WfInstance

    - **id**: The id to retrieve, usually stored in the collection as a filename that ends in .json
    """
    wf_instance = serialize_wf_instance(wf_instance_collection.find_one({'_id': id}))
    return {
        'detail': ('WfInstance retrieved.'
                   if wf_instance else
                   'WfInstance not found.'),
        'result': wf_instance
    }


@router.post('/github/{owner}/{repo}', response_model=ApiResponse)
async def post_wf_instances_github(owner: str, repo: str) -> dict[str, str | list]:
    """
    Insert WfInstances and generate their metrics from a GitHub repository into the MongoDB collections.

    - **owner**: The owner of the GitHub repository
    - **repo**: The name of the GitHub repository
    """
    valid_wf_instances, invalid_wf_instances = insert_wf_instances_from_github(owner, repo)
    return {
        'detail': ('Some WfInstances were not added, check that they follow the WfFormat.'
                   if len(invalid_wf_instances) > 0 else
                   'All WfInstances were successfully added.'),
        'result': {
            'successes': valid_wf_instances,
            'errors': invalid_wf_instances
        }
    }


@router.put('/json', response_model=ApiResponse)
async def put_wf_instance_json(file: UploadFile) -> dict[str, str]:
    """
    Insert a WfInstance and generate their metrics from a JSON file into the MongoDB collections.

    - **Request body**: The JSON file
    """
    wf_instance = json.loads(file.file.read())
    insert_wf_instance(wf_instance, file.filename)
    return {
        'detail': 'The WfInstance was successfully added.',
        'result': file.filename
    }
