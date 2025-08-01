from fastapi import APIRouter
from src.database import downloads_collection, visualizations_collection, simulations_collection
from src.usage.service import group_by_week, group_by_monthly, get_top_countries, get_num_countries, get_num_ips
from src.models import ApiResponse

router = APIRouter()

# @router.get('/public/', response_model=ApiResponse)
# async def get_number_of_instances_downloaded() -> dict:
#     """
#     Get all data related to downloads, visualizations, and simulations.
#     """
#     downloads_data = list(downloads_collection.find({}))
#     visualizations_data = list(visualizations_collection.find({}))
#     simulations_data = list(simulations_collection.find({}))
#
#     downloads_list = [{
#         "id": str(download['_id']),
#         "date": download['date'],
#         "ip": download['ip'],
#         "wfinstances": download['wfinstances'],
#         "num_instances": download['num_instances'],
#     } for download in downloads_data]
#
#     visualizations_list = [{
#         "id": str(visualization['_id']),
#         "date": visualization['date'],
#         "ip": visualization['ip'],
#         "wfinstance": visualization['wfinstance'],
#     } for visualization in visualizations_data]
#
#     simulations_list = [{
#         "id": str(simulation['_id']),
#         "date": simulation['date'],
#         "ip": simulation['ip'],
#         "wfinstance": simulation['wfinstance'],
#     } for simulation in simulations_data]
#
#     combined_data = {
#         "downloads": downloads_list,
#         "visualizations": visualizations_list,
#         "simulations": simulations_list
#     }
#
#     return {
#         'detail': 'Data retrieved successfully.' if combined_data else 'No data retrieved.',
#         'result': combined_data
#     }

@router.get('/public/downloads/', response_model=ApiResponse)
async def get_summarized_downloads() -> dict:
    downloads_data = list(downloads_collection.find({}))
    summarized_data = group_by_week(downloads_data, "downloads")
    return {
        'detail': 'Data retrieved successfully.' if summarized_data else 'No data retrieved.',
        'result': summarized_data
    }

@router.get('/public/visualizations/', response_model=ApiResponse)
async def get_summarized_visualizations() -> dict:
    visualizations_data = list(visualizations_collection.find({}))
    summarized_data = group_by_week(visualizations_data, "visualizations")
    return {
        'detail': 'Data retrieved successfully.' if summarized_data else 'No data retrieved.',
        'result': summarized_data
    }

@router.get('/public/simulations/', response_model=ApiResponse)
async def get_summarized_simulations() -> dict:
    simulations_data = list(simulations_collection.find({}))
    summarized_data = group_by_week(simulations_data, "simulations")
    return {
        'detail': 'Data retrieved successfully.' if summarized_data else 'No data retrieved.',
        'result': summarized_data
    }

@router.get('/public/totals/', response_model=ApiResponse)
async def get_totals() -> dict:

    # Instead of counting documents, sum the num_instances field for downloads.
    downloads_data = list(downloads_collection.find({}))
    visualizations_data = list(visualizations_collection.find({}))
    simulations_data = list(simulations_collection.find({}))

    downloads_total = sum(download.get('num_instances', 1) for download in downloads_data)
    visualizations_total = len(visualizations_data)
    simulations_total = len(simulations_data)
    ips_total = get_num_ips()
    countries_total = get_num_countries()

    totals = {
        "downloads": downloads_total,
        "visualizations": visualizations_total,
        "simulations": simulations_total,
        "ips": ips_total,
        "countries": countries_total
    }
    return {
        'detail': 'Data retrieved successfully.',
        'result': totals
    }

@router.get('/public/monthly_usage/{data_type}/', response_model=ApiResponse)
async def get_monthly_usage(data_type: str) -> dict:
    """
    Get the total data (downloads, visualizations, or simulations) and unique IPs for each month.
    The x-axis is total data for the month, and y-axis represents the month.
    """
    # Define which collection to use based on the `data_type`
    if data_type == "downloads":
        data_collection = downloads_collection
    elif data_type == "visualizations":
        data_collection = visualizations_collection
    elif data_type == "simulations":
        data_collection = simulations_collection
    else:
        return {
            'detail': 'Invalid data type specified.',
            'result': []
        }
    data = list(data_collection.find({}))
    print(f"Fetched data: {data}")
    summarized_data = group_by_monthly(data, data_type)
    chart_data = []
    for month_data in summarized_data:
        chart_data.append({
            "month": month_data["month"],  # Use "month" as ISO date string
            f"{data_type}_total": month_data[data_type],
            "ips": month_data["ips"]
        })
    # Sort chart data chronologically
    chart_data = sorted(chart_data, key=lambda x: x["month"])
    return {
        'detail': 'Data retrieved successfully.' if chart_data else 'No data retrieved.',
        'result': chart_data
    }

@router.get('/public/top-countries/', response_model=ApiResponse)
async def get_top_countries_route() -> dict:
    # Get top 10 countries based on combined usage
    top_countries = get_top_countries()
    return {
        'detail': 'Data retrieved successfully.',
        'result': top_countries
    }
