from fastapi import APIRouter
from src.database import metrics_collection
from src.metrics.serializer import serialize_metrics, serialize_metric
from src.models import ApiResponse

router = APIRouter()


@router.get('/', response_model=ApiResponse)
async def get_all_metrics() -> dict[str, str | list[dict]]:
    metrics = serialize_metrics(metrics_collection.find())
    return {
        'detail': ('Metrics retrieved.'
                   if len(metrics) > 0 else
                   'No metrics retrieved.'),
        'result': metrics
    }


@router.get('/{id}', response_model=ApiResponse)
async def get_metric(id: str) -> dict[str, dict]:
    metric = serialize_metric(metrics_collection.find_one({'_id': id}))
    return {
        'detail': ('Metric retrieved.'
                   if metric else
                   'Metric not found.'),
        'result': metric
    }

