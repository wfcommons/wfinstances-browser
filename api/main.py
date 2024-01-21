import os, certifi
from dotenv import load_dotenv
from fastapi import FastAPI
from pymongo.mongo_client import MongoClient

load_dotenv()

app = FastAPI()
uri = os.getenv('MONGO_URI')
client = MongoClient(uri, tlsCAFile=certifi.where())

try:
    client.admin.command('ping')
    print('Successfully connected to MongoDB')
except Exception as e:
    print('Failed to connect to MongoDB:', e)

