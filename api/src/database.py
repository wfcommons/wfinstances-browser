import os, certifi
from dotenv import load_dotenv
from pymongo import MongoClient
import sys

load_dotenv()

uri = os.getenv('MONGO_URI')
client = MongoClient(uri, tlsCAFile=certifi.where()) if 'mongodb+srv://' in uri else MongoClient(uri)
db = client.wf_instance_browser_db

# Collections
metrics_collection = db['metrics_collection']
usage_collection = db['usage_collection']
