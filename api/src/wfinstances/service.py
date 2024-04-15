import requests
from jsonschema import validate, ValidationError
from src.wfinstances.exceptions import InvalidWfInstanceException


def retrieve_wf_instances(metrics: list[dict]) -> list[dict]:
    """
    Retrieve a list of WfInstances from the download URL stored in each metric.

    Args:
        metrics: The list of metrics
    """
    return [retrieve_wf_instance(metric) for metric in metrics]


def retrieve_wf_instance(metric: dict) -> dict:
    """
    Retrieve a WfInstance from the download URL stored in a metric.

    Args:
        metric: The metric
    """
    download_url = metric['downloadUrl']
    wf_instance = requests.get(download_url).json()
    return wf_instance


def validate_wf_instance(wf_instance: dict) -> None:
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
