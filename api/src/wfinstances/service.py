import requests
from fastapi import HTTPException
from jsonschema import validate, ValidationError
from src.database import wf_instance_collection, metrics_collection
from src.metrics.service import generate_metrics
from src.wfinstances.exceptions import InvalidWfInstanceException


def insert_wf_instances_from_github(owner: str, repo: str) -> tuple[list, list]:
    """
    Insert WfInstances and generate their metrics from a GitHub repository into the MongoDB collections.

    Args:
        owner: The owner of the GitHub repository
        repo: The name of the GitHub repository
        path: The path of a directory in the GitHub repository

    Raises:
        HTTPException: GitHub repository does not exist

    Returns: Valid and invalid JSON filenames that match and mismatches the WfInstance schema
    """
    valid_wf_instances, invalid_wf_instances = [], []

    def recurse_dir(path='') -> None:
        url = f'https://api.github.com/repos/{owner}/{repo}/contents/{path}'
        response = requests.get(url)

        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail=response.json().get('message'))

        for file in response.json():
            if file['type'] == 'dir':
                recurse_dir(file['path'])
            elif str.endswith(file['name'], '.json'):
                wf_instance = requests.get(file['download_url']).json()

                try:
                    _validate_wf_instance(wf_instance)
                except InvalidWfInstanceException:
                    invalid_wf_instances.append(file['name'])
                    continue

                valid_wf_instances.append(file['name'])

                # Replace if already exists, otherwise add into wf_instances_collection
                wf_instance['_id'] = file['name']
                wf_instance_collection.find_one_and_update(
                    {'_id': wf_instance['_id']},
                    {'$set': wf_instance},
                    upsert=True)

                # Replace if already exists, otherwise add into  metrics_collection
                metrics = generate_metrics(wf_instance)
                metrics['_id'] = file['name']
                metrics['_githubRepo'] = f'{owner}/{repo}'
                metrics_collection.find_one_and_update(
                    {'_id': metrics['_id']},
                    {'$set': metrics},
                    upsert=True)

    recurse_dir()
    return valid_wf_instances, invalid_wf_instances


def insert_wf_instance(wf_instance: dict, file_name: str) -> None:
    """
     Insert a WfInstance and generate their metrics from a dictionary into the MongoDB collections.

     Args:
         wf_instance: The WfInstance to generate metrics and insert into the MongoDB collections
         file_name: The name of WfInstance file to set as the _id in the MongoDB collections

    Raises:
        InvalidWfInstanceException: The WfInstance does not match the expected schema
    """
    _validate_wf_instance(wf_instance)

    wf_instance['_id'] = file_name
    wf_instance_collection.find_one_and_update(
        {'_id': wf_instance['_id']},
        {'$set': wf_instance},
        upsert=True)

    wf_instance_metrics = generate_metrics(wf_instance)
    wf_instance_metrics['_id'] = file_name
    wf_instance_metrics['_githubRepo'] = ''
    metrics_collection.find_one_and_update(
        {'_id': wf_instance_metrics['_id']},
        {'$set': wf_instance_metrics},
        upsert=True)


def _validate_wf_instance(wf_instance: dict) -> None:
    """
    Validates the WfInstance dictionary.

    Args:
        wf_instance: The WfInstance dictionary to validate

    Raises:
        InvalidWfInstanceException: The WfInstance does not match the expected schema
    """
    schema = requests.get('https://raw.githubusercontent.com/wfcommons/WfFormat/main/wfcommons-schema.json').json()
    try:
        validate(wf_instance, schema=schema)
    except ValidationError as e:
        raise InvalidWfInstanceException(str(e))
