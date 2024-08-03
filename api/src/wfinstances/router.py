from fastapi import APIRouter
from src.database import metrics_collection
from src.metrics.serializer import serialize_metrics, serialize_metric
from src.models import ApiResponse
from src.wfinstances.service import retrieve_wf_instances, retrieve_wf_instance

router = APIRouter()


@router.post('/public/', response_model=ApiResponse)
async def post_query_wf_instances(ids: list[str]) -> dict:
    """
    Get a list of WfInstances.

    - **Request body**: List of ids to retrieve, usually stored in the collection as a filename that ends in .json
    """
    wf_instances = retrieve_wf_instances(serialize_metrics(metrics_collection.find({'_id': {'$in': ids}})))
    return {
        'detail': ('WfInstances retrieved.'
                   if len(ids) == len(wf_instances) else
                   'Some of the WfInstances were not retrieved.'),
        'result': wf_instances
    }


@router.get('/public/viz/{id}', response_model=ApiResponse)
async def get_wf_instance(id: str) -> dict:
    """
    Get a single WfInstance for visualization purposes

    - **id**: The id to retrieve, usually stored in the collection as a filename that ends in .json
    """

    print("SOMEBODY REQUESTED A VIZ, I SHOULD INCREMENT USAGE\m")

    wf_instance = retrieve_wf_instance(serialize_metric(metrics_collection.find_one({'_id': id})))
    return {
        'detail': ('WfInstance retrieved.'
                   if wf_instance else
                   'WfInstance not found.'),
        'result': wf_instance
    }
