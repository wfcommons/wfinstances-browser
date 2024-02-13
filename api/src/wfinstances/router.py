import json
from fastapi import APIRouter, UploadFile
from src.database import wf_instance_collection, wf_instance_metrics_collection
from src.models import ApiResponse
from src.wfinstances.serializer import serialize_wf_instance, serialize_wf_instances
from src.wfinstances.service import insert_wf_instance, insert_wf_instances_from_github

router = APIRouter()


@router.post('/', response_model=ApiResponse)
async def get_wf_instances(ids: list[str]) -> dict[str, list[dict]]:
    wf_instances = serialize_wf_instances(wf_instance_collection.find({'_id': {'$in': ids}}))
    return {
        'detail': ('WfInstances retrieved.'
                   if len(ids) == len(wf_instances) else
                   'Some or all of the WfInstances were not retrieved.'),
        'result': wf_instances
    }


@router.delete('/', response_model=ApiResponse)
async def delete_wf_instances(ids: list[str]) -> dict[str, str]:
    wf_instance_collection.delete({'_id': {'$in': ids}})
    wf_instance_metrics_collection.delete({'_id': {'$in': ids}})
    return {
        'detail': 'The WfInstances were deleted successfully.',
        'result': ids
    }


@router.delete('/{id}', response_model=ApiResponse)
async def delete_wf_instance(id: str) -> dict[str, str]:
    wf_instance_collection.delete_one({'_id': id})
    wf_instance_metrics_collection.delete_one({'_id': id})
    return {
        'detail': 'The WfInstance was deleted successfully.',
        'result': id
    }


@router.get('/{id}', response_model=ApiResponse)
async def get_wf_instance(id: str) -> dict[str, dict]:
    wf_instance = serialize_wf_instance(wf_instance_collection.find_one({'_id': id}))
    return {
        'detail': ('WfInstance retrieved.'
                   if wf_instance else
                   'WfInstance not found.'),
        'result': wf_instance
    }


@router.post('/github/{owner}/{repo}', response_model=ApiResponse)
async def post_wf_instances_github(owner: str, repo: str) -> dict[str, str | list]:
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
    wf_instance = json.loads(file.file.read())
    insert_wf_instance(wf_instance, file.filename)
    return {
        'detail': 'The WfInstance was successfully added.',
        'result': file.filename
    }
