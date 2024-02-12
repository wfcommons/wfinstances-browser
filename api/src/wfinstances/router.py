import json
from fastapi import APIRouter, UploadFile
from src.database import wf_instance_collection
from src.wfinstances.serializer import serialize_wf_instance, serialize_wf_instances
from src.wfinstances.service import insert_wf_instance, insert_wf_instances_from_github

router = APIRouter()


@router.post('/')
async def get_wf_instances(ids: list[str]) -> list[dict]:
    return serialize_wf_instances(wf_instance_collection.find({'_id': {'$in': ids}}))


@router.delete('/')
async def delete_wf_instances(ids: list[str]) -> dict:
    wf_instance_collection.delete({'_id': {'$in': ids}})
    return {'detail': 'The WfInstances were deleted successfully'}


@router.delete('/{id}')
async def delete_wf_instance(id: str) -> dict:
    wf_instance_collection.delete_one({'_id': id})
    return {'detail': 'The WfInstance was deleted successfully'}


@router.get('/{id}')
async def get_wf_instance(id: str) -> dict:
    return serialize_wf_instance(wf_instance_collection.find_one({'_id': id}))


@router.post('/github/{owner}/{repo}')
async def post_wf_instances_github(owner: str, repo: str) -> dict:
    valid_wf_instances, invalid_wf_instances = insert_wf_instances_from_github(owner, repo)
    return {
        'detail': 'Some WfInstances were not added, check that they follow the WfFormat.'
        if len(invalid_wf_instances) > 0 else 'All WfInstances were successfully added.',
        'success': valid_wf_instances,
        'errors': invalid_wf_instances
    }


@router.put('/json')
async def put_wf_instance_json(file: UploadFile) -> dict:
    insert_wf_instance(json.loads(file.file.read()), file.filename)
    return {'detail': 'The WfInstance was successfully added.'}
