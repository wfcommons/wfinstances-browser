import requests
import wrench
import pathlib
# import json
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

def do_simulation(request_platform_xml, request_controller_host, wf_instance):
    print(f"Instantiating a simulation...")
    simulation = wrench.Simulation()
    user_host = request_controller_host
    print(f"Starting the simulation using the XML platform file...")
    simulation.start(request_platform_xml, user_host)

    # Get the list of all hostnames in the platform
    print(f"Getting the list of all hostnames...")
    list_of_hostnames = simulation.get_all_hostnames()

    if not "UserHost" in list_of_hostnames:
        raise Exception("This simulator assumes that the XML platform files has a host with hostname UserHost that"
                        " has a disk mounted at '/'")
    list_of_hostnames.remove("UserHost")

    # Start a storage service on the user host
    print(f"Starting a storage service...")
    ss = simulation.create_simple_storage_service(user_host, ["/"])

    # Creating a bare-metal compute service on ALL other hosts
    print(f"Creating {len(list_of_hostnames)} compute services...")
    running_bmcss = []
    bmcs_to_cluster_map={}
    for host in list_of_hostnames:
        bmcs = simulation.create_bare_metal_compute_service(host, {host: (-1, -1)}, "", {}, {})
        running_bmcss.append(bmcs)
        bmcs_to_cluster_map[bmcs.get_name()] = int(host.split("-")[0])

    # Create a data structure that keeps track of the compute resources, which
    # will be used for scheduling
    print(f"Creating a convenient data structure for scheduling...")
    compute_resources: dict[ComputeService, dict] = {}
    for bmcs in running_bmcss:
        # print(f"Getting core counts...")
        per_host_num_cores = bmcs.get_core_counts()
        num_cores = per_host_num_cores[list(per_host_num_cores.keys())[0]]
        # print(f"Getting core flop rates...")
        per_host_core_speed = bmcs.get_core_flop_rates()
        core_speed = per_host_core_speed[list(per_host_core_speed.keys())[0]]
        compute_resources[bmcs] = {"num_idle_cores": num_cores, "core_speed": core_speed}
    # print(compute_resources)

    # Import the workflow from JSON
    print(f"Importing the workflow from JSON...")
    workflow = simulation.create_workflow_from_json(wf_instance,
                                                    reference_flop_rate="100Mf",
                                                    ignore_machine_specs=True,
                                                    redundant_dependencies=False,
                                                    ignore_cycle_creating_dependencies=False,
                                                    min_cores_per_task=1,
                                                    max_cores_per_task=1,
                                                    enforce_num_cores=True,
                                                    ignore_avg_cpu=True,
                                                    show_warnings=True)

    # Create all needed files on the storage service
    print(f"Create all file copies on the storage service...")
    files = workflow.get_input_files()
    for f in files:
        ss.create_file_copy(f)

    events = []
    # We are now ready to schedule the workflow
    print(f"Starting my main loop!")
    while not workflow.is_done():
        # Perform some scheduling, perhaps
        schedule_tasks(simulation, workflow.get_ready_tasks(), compute_resources, ss)

        # Wait for next event
        event = simulation.wait_for_next_event()
        print(event)
        if event["event_type"] != "standard_job_completion":
            print(f"  - Event: {event}")  # Should make sure it's a job completion
        else:
            events.append({
                "task_name": event["standard_job"].get_tasks()[0].get_name(),
                "cluster_index": bmcs_to_cluster_map[event["compute_service"].get_name()],
                "scheduled_time": event["submit_date"],
                "completion_time": event["end_date"]
            })
            completed_job = event["standard_job"]
            completed_task_name = completed_job.get_tasks()[0].get_name()
            print(f"Task {completed_task_name} has completed!")
            compute_resources[event["compute_service"]]["num_idle_cores"] += 1

    print(f"Workflow execution completed at time {simulation.get_simulated_time()}!")
    print(f"Workflow execution events {events}!")
    simulation_events = events

    return simulation_events


def generate_xml(clusterData):
    print(f"clusterData before parsing: {clusterData}")
    xml_string = f"""<?xml version='1.0'?>
 <!DOCTYPE platform SYSTEM "https://simgrid.org/simgrid.dtd">
 <platform version="4.1">
   <zone id="world" routing="Full">

     <zone id="outside" routing="None">
       <host id="UserHost" speed="1Gf">
         <disk id="hard_drive" read_bw="{clusterData["readBandwidth"]}MBps" write_bw="{clusterData["writeBandwidth"]}MBps">
           <prop id="size" value="5000GiB"/>
           <prop id="mount" value="/"/>
         </disk>
       </host>
     </zone>"""

    for id, values in clusterData["clusters"].items():
        prefix = str(int(id) - 1)
        xml_string += f"""
            <cluster id="datacenter{id}" prefix="{prefix}-" suffix=".me" radical="0-{values['computeNodes'] - 1}" 
            speed="{values['speed']}Gf" bw="125MBps" lat="50us" router_id="router{id}" core="{values['cores']}"/>"""

    for id, values in clusterData["clusters"].items():
        xml_string += f"""
            <link id="link{id}" bandwidth="{values['bw']}kBps" latency="{values['latency']}ms"/>"""

    for id, values in clusterData["clusters"].items():
        xml_string += f"""
            <zoneRoute src="datacenter{id}" dst="outside" gw_src="router{id}" gw_dst="UserHost">
                  <link_ctn id="link{id}"/>
                </zoneRoute>"""

    xml_string += """
    </zone>
</platform>"""

    print(xml_string)
    return xml_string
