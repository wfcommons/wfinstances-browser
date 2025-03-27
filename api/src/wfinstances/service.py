import requests
import wrench
import pathlib
import json
from jsonschema import validate, ValidationError
from src.exceptions import InvalidWfInstanceException, GithubResourceNotFoundException
from src.wfinstances.simulation import schedule_tasks
from typing import List, Dict
from wrench.simulation import Simulation  # For type checking
from wrench.task import Task  # For type checking
from wrench.compute_service import ComputeService  # For type checking


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

    file_path = metric['filePath']
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            wf_instance = json.load(f)
    except json.JSONDecodeError:
        sys.stderr.write(f"Invalid JSON format: {file}\n")
        wf_instances = None
    return wf_instance


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


def generate_xml(cluster_data):
    # print(f"cluster_data before parsing: {cluster_data}")
    xml_string = f"""<?xml version='1.0'?>
 <!DOCTYPE platform SYSTEM "https://simgrid.org/simgrid.dtd">
 <platform version="4.1">
   <zone id="world" routing="Full">

     <zone id="outside" routing="None">
       <host id="UserHost" speed="1Gf">
         <disk id="hard_drive" read_bw="{cluster_data["readBandwidth"]}MBps" write_bw="{cluster_data["writeBandwidth"]}MBps">
           <prop id="size" value="5000GiB"/>
           <prop id="mount" value="/"/>
         </disk>
       </host>
     </zone>"""

    for id, values in cluster_data["clusters"].items():
        prefix = str(int(id))
        xml_string += f"""
            <cluster id="datacenter{id}" prefix="{prefix}-" suffix=".me" radical="0-{values['computeNodes'] - 1}" 
            speed="{values['speed']}Gf" bw="125MBps" lat="50us" router_id="router{id}" core="{values['cores']}"/>"""

    for id, values in cluster_data["clusters"].items():
        xml_string += f"""
            <link id="link{id}" bandwidth="{values['bw']}MBps" latency="{values['latency']}ms"/>"""

    for id, values in cluster_data["clusters"].items():
        xml_string += f"""
            <zoneRoute src="datacenter{id}" dst="outside" gw_src="router{id}" gw_dst="UserHost">
                  <link_ctn id="link{id}"/>
                </zoneRoute>"""

    xml_string += """
    </zone>
</platform>"""

    # print(xml_string)
    return xml_string
