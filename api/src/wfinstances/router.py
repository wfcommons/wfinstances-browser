from fastapi import APIRouter, Request
from src.wfinstances.service import retrieve_wf_instance, retrieve_wf_instances, do_simulation
from src.metrics.serializer import serialize_metrics, serialize_metric
from src.models import ApiResponse
from src.database import metrics_collection, add_item_to_downloads_collection, add_item_to_visualizations_collection, update_simulation_collection

router = APIRouter()

@router.post('/public/', response_model=ApiResponse)
async def post_query_wf_instances(request: Request, ids: list[str]) -> dict:
    # Call the function to update the downloads collection
    add_item_to_downloads_collection(ids, request.client.host)

    wf_instances = retrieve_wf_instances(serialize_metrics(metrics_collection.find({'_id': {'$in': ids}})))
    return {
        'detail': ('WfInstances retrieved.'
                   if len(ids) == len(wf_instances) else
                   'Some of the WfInstances were not retrieved.'),
        'result': wf_instances
    }

@router.get('/public/viz/{id}', response_model=ApiResponse)
async def get_wf_instance(request: Request, id: str) -> dict:
    # Call the function to update the visualizations collection
    add_item_to_visualizations_collection(id, request.client.host)

    wf_instance = retrieve_wf_instance(serialize_metric(metrics_collection.find_one({'_id': id})))
    return {
        'detail': ('WfInstance retrieved.'
                   if wf_instance else
                   'WfInstance not found.'),
        'result': wf_instance
    }

@router.post('/public/simulate/{id}', response_model=ApiResponse)
async def post_wf_instance(request: Request, id: str) -> dict:
    # Call the function to update the simulation collection
    update_simulation_collection(id, request.client.host)

    print("BACKEND RECEIVED A SIMULATION REQUEST")
    print(f"THE ID RECEIVED IS: {id}")

    request_body = await request.json()
    print(f"THE REQUEST BODY HAS THE FOLLOWING FIELDS: {request_body.keys()}")
    print("I NOW SHOULD RUN A SIMULATION USING THE WRENCH PYTHON API")

    wf_instance = retrieve_wf_instance(serialize_metric(metrics_collection.find_one({'_id': id})))

    # make a path to the xml file
    platform_file_path = "/tmp/platform.xml"
    with open(platform_file_path, "w") as f:
        f.write(request_body["platform_xml"])

    runtime = do_simulation(platform_file_path, request_body["controller_hostname"], wf_instance)

    return {
        'detail': 'Simulation results',
        'result': {'Runtime': runtime}
    }
