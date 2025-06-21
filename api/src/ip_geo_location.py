from datetime import datetime, timedelta
from collections import defaultdict
from functools import lru_cache
import ipinfo
import os

@lru_cache(maxsize=1024)
def lookup_country(ip: str) -> str:
    access_token = os.getenv("IPINFO_TOKEN")
    if not access_token:
        print("IPINFO_TOKEN environment variable is not set.")
        return "Unknown"
    try:
        handler = ipinfo.getHandler(access_token)
        details = handler.getDetails(ip)
        country = details.details.get("country_name") or details.details.get("country")
        return country if country and country.strip() != "" else "Unknown"
    except Exception as e:
        print(f"Error fetching country for IP {ip}: {e}")
        return "Unknown"