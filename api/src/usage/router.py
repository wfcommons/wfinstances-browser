from fastapi import APIRouter
from src.database import usage_collection
from src.models import ApiResponse
from bson.json_util import dumps


router = APIRouter()

@router.get('/public/', response_model=ApiResponse)
async def get_number_of_instances_downloaded() -> dict:
    """
    Get all the number_of_instances_downloaded.
    """
    usage = usage_collection.find_one({})
    # TODO: Find a way to convert the usage variable to a dict... should be one weird...!!
    return {
        'detail': ('Usage data retrieved.'
                   if usage else
                   'No usage data retrieved.'),
        'result': {"download_count": usage['download_count'],
                   "viz_count": usage['viz_count']}
    }

