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

@router.put('/private/increment/{increment}', response_model=ApiResponse)
async def increment_number_of_instances_downloaded(increment: int) -> int:
    """
    Increment the number of downloads

    - **increment**: By how much to increment
    """
    # Insert an item if none
    if usage_collection.find_one({}) == None:
        usage_collection.insert_one({"count":0})

    # Find the current count
    current_count = usage_collection.find_one({})['count']
    usage_collection.find_one_and_update(
        {},
        {'$set': {'count': current_count + increment}},
        upsert=True)

    return {
        'detail': ('Download count incremented'),
        'result': {
            'success'
        }
    }

