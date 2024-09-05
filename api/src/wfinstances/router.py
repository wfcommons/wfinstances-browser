from fastapi import APIRouter, Request
from src.wfinstances.service import update_download_collection, update_visualization_collection, update_simulation_collection
from src.metrics.serializer import serialize_metrics, serialize_metric
from src.models import ApiResponse
from src.database import metrics_collection

router = APIRouter()

@router.post('/public/', response_model=ApiResponse)
async def post_query_wf_instances(request: Request, ids: list[str]) -> dict:
    # Call the function to update the download collection
    update_download_collection(ids, request.state.client_ip)

    wf_instances = retrieve_wf_instances(serialize_metrics(metrics_collection.find({'_id': {'$in': ids}})))
    return {
        'detail': ('WfInstances retrieved.'
                   if len(ids) == len(wf_instances) else
                   'Some of the WfInstances were not retrieved.'),
        'result': wf_instances
    }

@router.get('/public/viz/{id}', response_model=ApiResponse)
async def get_wf_instance(request: Request, id: str) -> dict:
    # Call the function to update the visualization collection
    update_visualization_collection(id, request.state.client_ip)

    wf_instance = retrieve_wf_instance(serialize_metric(metrics_collection.find_one({'_id': id})))
    return {
        'detail': ('WfInstance retrieved.'
                   if wf_instance else
                   'WfInstance not found.'),
        'result': wf_instance
    }

@router.get('/public/simulate/{id}', response_model=ApiResponse)
async def get_wf_instance(request: Request, id: str) -> dict:
    # Call the function to update the simulation collection
    update_simulation_collection(id, request.state.client_ip)

    wf_instance = retrieve_wf_instance(serialize_metric(metrics_collection.find_one({'_id': id})))
    return {
        'detail': ('WfInstance retrieved.'
                   if wf_instance else
                   'WfInstance not found.'),
        'result': wf_instance
    }
