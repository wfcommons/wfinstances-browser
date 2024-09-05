from fastapi import APIRouter
from src.database import downloads_collection, visualizations_collection, simulations_collection
from src.models import ApiResponse
from collections import defaultdict
from datetime import datetime, timedelta

router = APIRouter()

@router.get('/public/', response_model=ApiResponse)
async def get_number_of_instances_downloaded() -> dict:
    """
    Get all data related to downloads, visualizations, and simulations.
    """

    # Fetch all documents in the collections
    downloads_data = list(downloads_collection.find({}))
    visualizations_data = list(visualizations_collection.find({}))
    simulations_data = list(simulations_collection.find({}))

    # Convert the BSON documents to dictionaries
    downloads_list = [{
        "id": download['_id'],
        "date": download['date'],
        "ip": download['ip'],
        "wfinstances": download['wfinstances'],
        "num_instances": download['num_instances'],
    } for download in downloads_data]

    visualizations_list = [{
        "id": visualization['_id'],
        "date": visualization['date'],
        "ip": visualization['ip'],
        "wfinstance": visualization['wfinstance'],
    } for visualization in visualizations_data]

    simulations_list = [{
        "id": simulation['_id'],
        "date": simulation['date'],
        "ip": simulation['ip'],
        "wfinstance": simulation['wfinstance'],
    } for simulation in simulations_data]

    # Combine all the data into a single dictionary
    combined_data = {
        "downloads": downloads_list,
        "visualizations": visualizations_list,
        "simulations": simulations_list
    }

    return {
        'detail': 'Data retrieved successfully.' if combined_data else 'No data retrieved.',
        'result': combined_data
    }

def group_by_week(data_list, date_key, count_key=None):
    # Dictionary to hold weekly data
    weekly_data = defaultdict(lambda: {"counts": [], "ips": set()})

    # Grouping data by week
    for item in data_list:
        date = item[date_key].date()
        # Calculate the start of the week (Monday)
        week_start = date - timedelta(days=date.weekday())

        if count_key:
            # Append count and unique IPs for downloads
            weekly_data[week_start]["counts"].append(item[count_key])
        weekly_data[week_start]["ips"].update(item['ip_list'])

    return weekly_data

@router.get('/public/download', response_model=ApiResponse)
async def get_summarized_downloads() -> dict:
    downloads_data = list(downloads_collection.find({}))

    summarized_data = group_by_week(downloads_data, date_key='date', count_key='num_instances')

    return {
        'detail': 'Data retrieved successfully.' if summarized_data else 'No data retrieved.',
        'result': summarized_data
    }

@router.get('/public/visualizations', response_model=ApiResponse)
async def get_summarized_visualizations() -> dict:
    visualizations_data = list(visualizations_collection.find({}))

    summarized_data = group_by_week(visualizations_data, date_key='date')

    return {
        'detail': 'Data retrieved successfully.' if summarized_data else 'No data retrieved.',
        'result': summarized_data
    }

@router.get('/public/simulations', response_model=ApiResponse)
async def get_summarized_simulations() -> dict:
    simulations_data = list(simulations_collection.find({}))

    summarized_data = group_by_week(simulations_data, date_key='date')

    return {
        'detail': 'Data retrieved successfully.' if summarized_data else 'No data retrieved.',
        'result': summarized_data
    }
