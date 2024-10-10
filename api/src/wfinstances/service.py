import requests
import wrench
import pathlib
from jsonschema import validate, ValidationError
from src.exceptions import InvalidWfInstanceException, GithubResourceNotFoundException


def retrieve_wf_instances(metrics: list[dict]) -> list[dict]:
    """
    Retrieve a list of WfInstances from the download URL stored in each metric.

    Args:
        metrics: The list of metrics
    """
    return [retrieve_wf_instance(metric) for metric in metrics]


def retrieve_wf_instance(metric: dict) -> dict | None:
    """
    Retrieve a WfInstance from the download URL stored in a metric.

    Args:
        metric: The metric
    """
    if not metric:
        return None

    download_url = metric['downloadUrl']
    response = requests.get(download_url)

    if response.status_code != 200:
        return None
    return response.json()


def validate_wf_instance(wf_instance: dict) -> None:
    """
    Validates the WfInstance dictionary.

    Args:
        wf_instance: The WfInstance dictionary to validate

    Raises:
        InvalidWfInstanceException: The WfInstance does not match the expected schema
    """
    schema_url = 'https://raw.githubusercontent.com/wfcommons/WfFormat/main/wfcommons-schema.json'

    response = requests.get(schema_url)
    if response.status_code != 200:
        raise GithubResourceNotFoundException(schema_url)
    schema = response.json()

    try:
        validate(wf_instance, schema=schema)
    except ValidationError as e:
        raise InvalidWfInstanceException(str(e))
    
def do_simulation(request_platform_file_path, request_controller_host, wf_instance):
    print(f"Instantiating a simulation...")
    simulation = wrench.Simulation()
    controller_host = request_controller_host
    print(f"Starting the simulation using the XML platform file...")
    simulation.start(pathlib.Path(request_platform_file_path), controller_host)
    simulation_time = simulation.get_simulated_time()
    print(f"Simulation time: {simulation_time}")
    print(f"Sleeping for 10 seconds...")
    simulation.sleep(10)
    simulation_time = simulation.get_simulated_time()
    print(f"Simulation time: {simulation_time}")
    return simulation_time
