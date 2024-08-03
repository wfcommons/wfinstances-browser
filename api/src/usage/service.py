from src.database import usage_collection

def _increment_count(key: str, increment: int):
    current_count = usage_collection.find_one({})[key]
    usage_collection.find_one_and_update(
        {},
        {'$set': {key: current_count + increment}},
        upsert=True)

def increment_download_count(increment: int):
    _increment_count("download_count", increment)

def increment_viz_count():
    _increment_count("viz_count", 1)
