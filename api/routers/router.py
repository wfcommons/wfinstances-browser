from fastapi import APIRouter, Body
from models.wfformat import WfFormat
from config.database import wf_instance_collection
from serializers.serializer import serialize_wf_instance, serialize_wf_instances
from services.metrics_service import generate_metrics
from bson import ObjectId

router = APIRouter()


@router.get('/wf_instances')
async def get_wf_instances(page: int = 0, pageSize: int = 10):
    return serialize_wf_instances(wf_instance_collection
                                  .find()
                                  .skip(page * pageSize)
                                  .limit(pageSize))


@router.post('/wf_instances')
async def post_wf_instance(wf_instance: WfFormat):
    wf_instance_collection.insert_one(dict(wf_instance))


@router.get('/wf_instances/{id}/metrics')
async def get_wf_instance_metrics(id: str):
    # TODO: Change to retrieve from wf_instance_metrics database
    wf_instance = serialize_wf_instance(wf_instance_collection.find_one({'_id': ObjectId(id)}))
    return generate_metrics(wf_instance)
