import os, certifi
from dotenv import load_dotenv
from pymongo import MongoClient

load_dotenv()

uri = os.getenv('MONGO_URI')
client = MongoClient(uri, tlsCAFile=certifi.where()) if 'mongodb+srv://' in uri else MongoClient(uri)
db = client.wf_instance_browser_db

# Metrics collections
metrics_collection = db['metrics_collection']

# Usage collection (and initialization)
usage_collection = db['usage_collection']
# if usage_collection.find_one({}) == None:
if usage_collection.count_documents({}) == 0:
    usage_collection.insert_one({"download_count":0, "viz_count": 0})