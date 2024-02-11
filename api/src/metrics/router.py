from fastapi import APIRouter

from src.database import wf_instance_metrics_collection
from src.metrics.serializer import serialize_metrics, serialize_metric

router = APIRouter()


@router.get('/')
async def get_all_metrics():
    return serialize_metrics(wf_instance_metrics_collection.find())


@router.get('/{id}')
async def get_metric(id: str) -> dict:
    return serialize_metric(wf_instance_metrics_collection.find_one({'_id': id}))

