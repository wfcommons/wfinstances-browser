from fastapi import APIRouter
from src.database import wf_instance_metrics_collection
from src.metrics.schema import serialize_wf_instances_metrics, serialize_wf_instance_metrics


router = APIRouter()


@router.get('/')
async def get_metrics():
    return serialize_wf_instances_metrics(wf_instance_metrics_collection.find())


@router.get('/{id}')
async def get_metrics(id: str):
    return serialize_wf_instance_metrics(wf_instance_metrics_collection.find_one({'_id': id}))

