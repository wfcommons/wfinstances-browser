from fastapi import APIRouter

from src.database import wf_instance_metrics_collection
from src.metrics.schema import serialize_wf_instances_metrics, serialize_wf_instance_metrics

router = APIRouter()


@router.get('/wf-instance-metrics')
async def get_wf_instance_metrics():
    return serialize_wf_instances_metrics(wf_instance_metrics_collection.find())


@router.get('/wf-instance-metrics/{id}')
async def get_wf_instance_metrics(id: str):
    return serialize_wf_instance_metrics(wf_instance_metrics_collection.find_one({'_id': id}))