import requests
from src.database import wf_instance_collection, wf_instance_metrics_collection
from src.metrics.service import generate_metrics
from wfcommons.wfinstances import SchemaValidator


def insert_wf_instances_from_github(owner: str, repo: str, path='') -> None:
    url = f'https://api.github.com/repos/{owner}/{repo}/contents/{path}'
    response = requests.get(url)

    if response.status_code != 200:
        print(f"Error: {response.text}")
        return

    for file in response.json():
        if file['download_url'] is None:
            insert_wf_instances_from_github(owner, repo, file['path'])
            continue
        if str.endswith(file['name'], '.json'):
            wf_instance = requests.get(file['download_url']).json()

            validator = SchemaValidator()
            validator.validate_instance(wf_instance)

            wf_instance['_id'] = file['name']
            wf_instance_collection.find_one_and_update(
                {'_id': wf_instance['_id']},
                {'$set': wf_instance},
                upsert=True)

            # Add/replace if already exists to wf_instance_metrics_collection
            wf_instance_metrics = generate_metrics(wf_instance)
            wf_instance_metrics['_id'] = file['name']
            wf_instance_metrics['_githubRepo'] = f'{owner}/{repo}'
            wf_instance_metrics_collection.find_one_and_update(
                {'_id': wf_instance_metrics['_id']},
                {'$set': wf_instance_metrics},
                upsert=True)


def insert_wf_instance(wf_instance: dict, file_name: str) -> None:
    validator = SchemaValidator()
    validator.validate_instance(wf_instance)

    wf_instance['_id'] = file_name
    wf_instance_collection.find_one_and_update(
        {'_id': wf_instance['_id']},
        {'$set': wf_instance},
        upsert=True)

    wf_instance_metrics = generate_metrics(wf_instance)
    wf_instance_metrics['_id'] = file_name
    wf_instance_metrics['_githubRepo'] = ''
    wf_instance_metrics_collection.find_one_and_update(
        {'_id': wf_instance_metrics['_id']},
        {'$set': wf_instance_metrics},
        upsert=True)
