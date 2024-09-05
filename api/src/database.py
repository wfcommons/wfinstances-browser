import os, certifi
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


def add_to_collection(collection_name: str, data: dict):
    collection = db[collection_name]
    # collection.update_one(
    #     {"_id": data.get("_id", None)},
    #     {"$set": data},
    #     upsert=True
    # )
    collection.insert_one(data)
