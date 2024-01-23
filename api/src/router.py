import json

from fastapi import APIRouter, UploadFile
from src.database import wf_instance_collection
from src.schema import serialize_wf_instance
from src.service import find_and_insert_wf_instances, insert_wf_instance

router = APIRouter()


@router.get('/wf-instance/{id}')
async def get_wf_instance(id: str):
    return serialize_wf_instance(wf_instance_collection.find_one({'_id': id}))


@router.post('/wf-instance/github/{owner}/{repo}')
async def post_wf_instance_github(owner: str, repo: str):
    find_and_insert_wf_instances(owner, repo)


@router.put('/wf-instance/json')
async def put_wf_instance_json(file: UploadFile):
    insert_wf_instance(json.loads(file.file.read()), file.filename)


@router.delete('/wf-instance/{id}')
async def delete_wf_instance(id: str):
    wf_instance_collection.delete_one({'_id': id})
