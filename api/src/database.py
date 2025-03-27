import os, certifi
from datetime import datetime
from dotenv import load_dotenv
from pymongo import MongoClient


load_dotenv()

uri = os.getenv('MONGO_URI')
client = MongoClient(uri, tlsCAFile=certifi.where()) if 'mongodb+srv://' in uri else MongoClient(uri)
db = client.wf_instance_browser_db

# Metrics collections
metrics_collection = db['metrics_collection']

# New collections for detailed logs
downloads_collection = db['downloads']
visualizations_collection = db['visualizations']
simulations_collection = db['simulations']

# Survey collections
surveys_collection = db['surveys']


def add_to_collection(collection_name: str, data: dict):
    db[collection_name].insert_one(data)

def add_item_to_downloads_collection(wf_ids: list[str], client_ip: str):
    collection_name = "downloads"

    data = {
        "date": datetime.utcnow().date().isoformat(),
        "ip": client_ip,
        "wfinstances": wf_ids,
        "num_instances": len(wf_ids)
    }

    add_to_collection(collection_name, data)

def add_item_to_visualizations_collection(wf_id: str, client_ip: str):
    collection_name = "visualizations"

    data = {
        "date": datetime.utcnow().date().isoformat(),
        "ip": client_ip,
        "wfinstance": wf_id,
    }

    add_to_collection(collection_name, data)

def update_simulation_collection(wf_id: str, client_ip: str):
    collection_name = "simulations"

    data = {
        "date": datetime.utcnow().date().isoformat(),
        "ip": client_ip,
        "wfinstance": wf_id,
    }

    add_to_collection(collection_name, data)

def add_to_surveys_collection(client_ip: str, total_clicks: int, rating: int):
    data = {
        "date": datetime.utcnow().isoformat(),
        "ip": client_ip,
        "total_clicks": total_clicks,
        "usefulness_rating": usefulness_rating,
        "usability_rating": usability_rating,
    }
    add_to_collection("surveys", data, update_existing=True)
