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
async def delete_wf_instances(ids: list[str]) -> None:
    wf_instance_collection.delete({'_id': {'$in': ids}})


@router.delete('/{id}')
async def delete_wf_instance(id: str) -> None:
    wf_instance_collection.delete_one({'_id': id})


@router.get('/{id}')
async def get_wf_instance(id: str) -> dict:
    return serialize_wf_instance(wf_instance_collection.find_one({'_id': id}))


@router.post('/github/{owner}/{repo}')
async def post_wf_instance_github(owner: str, repo: str) -> None:
    insert_wf_instances_from_github(owner, repo)


@router.put('/json')
async def put_wf_instance_json(file: UploadFile) -> None:
    insert_wf_instance(json.loads(file.file.read()), file.filename)
