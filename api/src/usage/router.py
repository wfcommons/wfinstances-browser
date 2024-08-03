from fastapi import APIRouter
from src.database import usage_collection
from src.models import ApiResponse
import sys

router = APIRouter()

@router.get('/public/', response_model=ApiResponse)
async def get_number_of_instances_downloaded() -> int:
    """
    Get all the number_of_instances_downloaded.
    """
    usage = usage_collection.find_one({})
    return {
        'detail': ('Download count retrieved.'
                   if len(usage) > 0 else
                   'No download count retrieved.'),
        'result': usage["count"]
    }

