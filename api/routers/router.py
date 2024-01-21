from fastapi import APIRouter, Body
from models.wfformat import WfFormat
from config.database import wf_instance_collection
from serializers.serializer import serialize_wf_instances
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
