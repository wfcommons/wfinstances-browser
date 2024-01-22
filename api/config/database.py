import os, certifi
from dotenv import load_dotenv
from pymongo import MongoClient

load_dotenv()

uri = os.getenv('MONGO_URI')
client = MongoClient(uri, tlsCAFile=certifi.where())
db = client.wf_instance_db

# Collections
wf_instance_collection = db['wf_instance_collection']
wf_instance_metrics_collection = db['wf_instance_metrics_collection']