from fastapi import APIRouter
from models.wfformat import WfFormat
from config.database import wf_instance_collection, wf_instance_metrics_collection
from serializers.serializer import serialize_wf_instance, serialize_wf_instance_metrics, serialize_wf_instances_metrics
from services.github_service import find_and_insert_wf_instances

router = APIRouter()


@router.get('/wf-instance/{id}')
async def get_wf_instance(id: str):
    return serialize_wf_instance(wf_instance_collection.find_one({'_id': id}))


@router.post('/wf-instance/github/{owner}/{repo}')
async def post_wf_instance_github(owner: str, repo: str):
    find_and_insert_wf_instances(owner, repo)


@router.put('/wf-instance/{id}')
async def put_wf_instance(id: str, wf_instance: WfFormat):
    wf_instance = dict(wf_instance)
    wf_instance['_id'] = id
    wf_instance_collection.insert_one(wf_instance)


@router.get('/wf-instance-metrics')
async def get_wf_instance_metrics():
    return serialize_wf_instances_metrics(wf_instance_metrics_collection.find())


@router.get('/wf-instance-metrics/{id}')
async def get_wf_instance_metrics(id: str):
    return serialize_wf_instance_metrics(wf_instance_metrics_collection.find_one({'_id': id}))
