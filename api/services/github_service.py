import requests
from config.database import wf_instance_collection, wf_instance_metrics_collection
from services.metrics_service import generate_metrics


def find_and_insert_wf_instances(owner, repo, path=''):
    url = f'https://api.github.com/repos/{owner}/{repo}/contents/{path}'
    response = requests.get(url)

    if response.status_code != 200:
        print(f"Error: {response.text}")
        return

    for file in response.json():
        if file['download_url'] is None:
            find_and_insert_wf_instances(owner, repo, file['path'])
            continue
        if str.endswith(file['name'], '.json'):
            # TODO: Apply JSON validation
            # Add/replace if already exists to wf_instance_collection
            wf_instance = requests.get(file['download_url']).json()
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

