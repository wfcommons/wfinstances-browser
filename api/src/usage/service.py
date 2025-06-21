from datetime import datetime, timedelta
from collections import defaultdict
import ipinfo
import os
from src.database import downloads_collection, visualizations_collection, simulations_collection
from src.ip_geo_location import lookup_country


def get_week_range(date):
    # Get the start (Sunday) and end (Saturday) of the week
    start_of_week = date - timedelta(days=date.weekday() + 1)
    end_of_week = start_of_week + timedelta(days=6)
    return start_of_week.strftime('%Y-%m-%d'), end_of_week.strftime('%Y-%m-%d')

def group_by_week(data, field_name):
    # Using a default dictionary to group data by week
    weekly_data = defaultdict(lambda: {field_name: 0, "ips": set()})

    for item in data:
        date = datetime.strptime(item['date'], '%Y-%m-%d')
        week_start, week_end = get_week_range(date)
        week = f"{week_start} - {week_end}"
        num_instances = item.get('num_instances', 1)
        weekly_data[week][field_name] += num_instances
        weekly_data[week]["ips"].add(item["ip"])

    result = [{
        "week": week,
        field_name: weekly_data[week][field_name],
        "ips": list(weekly_data[week]["ips"])
    } for week in weekly_data]

    return result

def get_month_range(date):
    # Return the ISO date string representing the first day of the month (e.g., "2024-01-01")
    start_of_month = date.replace(day=1)
    return start_of_month.strftime('%Y-%m-%d')

def group_by_monthly(data, field_name):
    # Using a defaultdict to group data by month (now with full date info)
    monthly_data = defaultdict(lambda: {field_name: 0, "ips": set()})

    for item in data:
        date = datetime.strptime(item['date'], '%Y-%m-%d')
        month_key = get_month_range(date)  # Now returns full ISO date string for the month
        num_instances = item.get('num_instances', 1)
        monthly_data[month_key][field_name] += num_instances
        monthly_data[month_key]["ips"].add(item["ip"])

    result = [{
        "month": month,  # Full ISO date string (e.g., "2024-01-01")
        field_name: monthly_data[month][field_name],
        "ips": list(monthly_data[month]["ips"])
    } for month in monthly_data]

    return result

def get_ip_country_name(ip_list: list[str]) -> list[tuple[str, str]]:
    result = []
    unique_ips = set(ip_list)
    for ip in unique_ips:
        country = lookup_country(ip)
        result.append((ip, country))
    return result

def get_top_countries(ip_list: list[str]) -> list[tuple[str, int]]:
    resolved = get_ip_country_name(ip_list)
    country_counts = {}
    for _, country in resolved:
        if country == "Unknown":
            continue
        country_counts[country] = country_counts.get(country, 0) + 1
    sorted_countries = sorted(country_counts.items(), key=lambda x: x[1], reverse=True)
    return sorted_countries[:10]

def get_num_countries(ip_list: list[str]) -> list[tuple[str, int]]:
    resolved = get_ip_country_name(ip_list)
    country_counts = {}
    for _, country in resolved:
        if country == "Unknown":
            continue
        country_counts[country] = country_counts.get(country, 0) + 1
    return len(country_counts)

def get_all_ips() -> list[str]:
    downloads_ips = [item["ip"] for item in downloads_collection.find({})]
    visualizations_ips = [item["ip"] for item in visualizations_collection.find({})]
    simulations_ips = [item["ip"] for item in simulations_collection.find({})]
    all_ips = list(set(downloads_ips + visualizations_ips + simulations_ips))
    return all_ips