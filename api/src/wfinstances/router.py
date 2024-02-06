import json
from typing import List
from fastapi import APIRouter, UploadFile
from src.database import wf_instance_collection
from src.wfinstances.schema import serialize_wf_instance, serialize_wf_instances
from src.wfinstances.service import find_and_insert_wf_instances, insert_wf_instance

router = APIRouter()


@router.post('/')
async def get_wf_instances(ids: List[str]):
    return serialize_wf_instances(wf_instance_collection.find_one({'_id': {'$in': ids}}))


@router.delete('/')
async def delete_wf_instances(ids: List[str]):
    wf_instance_collection.delete({'_id': {'$in': ids}})


@router.delete('/{id}')
async def delete_wf_instance(id: str):
    wf_instance_collection.delete_one({'_id': id})


@router.get('/{id}')
async def get_wf_instance(id: str):
    return serialize_wf_instance(wf_instance_collection.find_one({'_id': id}))


@router.post('/github/{owner}/{repo}')
async def post_wf_instance_github(owner: str, repo: str):
    find_and_insert_wf_instances(owner, repo)


@router.put('/json')
async def put_wf_instance_json(file: UploadFile):
    insert_wf_instance(json.loads(file.file.read()), file.filename)
