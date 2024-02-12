import requests
from fastapi import HTTPException
from src.database import wf_instance_collection, wf_instance_metrics_collection
from src.metrics.service import generate_metrics
from src.wfinstances.exceptions import InvalidWfInstanceException
from wfcommons.wfinstances import SchemaValidator


def insert_wf_instances_from_github(owner: str, repo: str, path='') -> tuple[list, list]:
    url = f'https://api.github.com/repos/{owner}/{repo}/contents/{path}'
    response = requests.get(url)

    if response.status_code != 200:
        raise HTTPException(status_code=response.status_code, detail=response.json().get('message'))

    valid_wf_instances, invalid_wf_instances = [], []
    for file in response.json():
        if file['download_url'] is None:
            insert_wf_instances_from_github(owner, repo, file['path'])
        elif str.endswith(file['name'], '.json'):
            wf_instance = requests.get(file['download_url']).json()
            try:
                _validate_wf_instance(wf_instance)
            except InvalidWfInstanceException as e:
                invalid_wf_instances.append(file['name'])
                continue

            valid_wf_instances.append(file['name'])

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

    return valid_wf_instances, invalid_wf_instances


def insert_wf_instance(wf_instance: dict, file_name: str) -> None:
    _validate_wf_instance(wf_instance)

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


def _validate_wf_instance(wf_instance: dict) -> None:
    try:
        validator = SchemaValidator()
        validator.validate_instance(wf_instance)
    except RuntimeError as e:
        raise InvalidWfInstanceException(str(e))
