import requests
from config.database import wf_instance_collection


def insert_wf_instances(owner, repo, path=''):
    url = f'https://api.github.com/repos/{owner}/{repo}/contents/{path}'
    response = requests.get(url)

    if response.status_code != 200:
        print(f"Error: {response.text}")
        return

    for file in response.json():
        if str.endswith(file['name'], '.json'):
            wf_instance = requests.get(file['download_url']).json()
            wf_instance_collection.insert_one(wf_instance)


def find_wf_instances(url):
    wf_instances = []

    response = requests.get(url)
    if response.status_code != 200:
        print(f"Error: {response.text}")
        return wf_instances

