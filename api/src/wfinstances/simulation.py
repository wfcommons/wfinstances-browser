from wrench.simulation import Simulation
from wrench.task import Task
from wrench.compute_service import ComputeService
from typing import List, Dict

task_data = {}
task_children = {}


def compute_task_data(task: Task):
    if task.get_name() not in task_data:
        data = 0
        for f in task.get_input_files():
            data += f.get_size()
        for f in task.get_output_files():
            data += f.get_size()
        task_data[task.get_name()] = data
    return task_data[task.get_name()]


def compute_task_children(task: Task):
    if task.get_name() not in task_children:
        task_children[task.get_name()] = task.get_number_of_children()
    return task_children[task.get_name()]


def pick_task_to_schedule_most_flops(tasks: List[Task]) -> Task:
    target_task = tasks[0]
    max_flop = target_task.get_flops()
    for task in tasks[1:]:
        if task.get_flops() > max_flop:
            max_flop = task.get_flops()
            target_task = task
    return target_task


def pick_task_to_schedule_most_data(tasks: List[Task]) -> Task:
    target_task = tasks[0]
    max_data = compute_task_data(target_task)
    for task in tasks[1:]:
        data = compute_task_data(task)
        if data > max_data:
            max_data = data
            target_task = task
    return target_task


def pick_task_to_schedule_most_children(tasks: List[Task]) -> Task:
    target_task = tasks[0]
    max_data = compute_task_children(target_task)
    for task in tasks[1:]:
        data = compute_task_children(task)
        if data > max_data:
            max_data = data
            target_task = task
    return target_task


def pick_task_to_schedule(tasks: List[Task], task_selection_scheme: str) -> Task:
    """
    A method to select a particular task to schedule.
    """
    if task_selection_scheme == "MostFlops":
        return pick_task_to_schedule_most_flops(tasks)
    elif task_selection_scheme == "MostData":
        return pick_task_to_schedule_most_data(tasks)
    elif task_selection_scheme == "MostChildren":
        return pick_task_to_schedule_most_children(tasks)
    else:
        raise Exception(f"Unknown task selection scheme: {task_selection_scheme}")


def pick_target_cs(compute_resources: Dict[ComputeService, Dict[str, float]], desired_num_cores: int,
                   cluster_selection_scheme: str) -> ComputeService | None:
    """
    A method to select a compute service on which to schedule a task. Right now,
    just selects the compute service with the largest flop rate
    """

    # Filter out the clusters that have sufficient idle cores
    candidate_clusters = [cs for cs in compute_resources.keys()
                          if compute_resources[cs]["num_idle_cores"] >= desired_num_cores]
    if len(candidate_clusters) == 0:
        return None

    if cluster_selection_scheme == "FastestCores":
        return sorted(candidate_clusters, key=lambda x: compute_resources[x]["core_speed"])[-1]
    elif cluster_selection_scheme == "FastestNetwork":
        return sorted(candidate_clusters, key=lambda x: compute_resources[x]["link_bandwidth"])[-1]
    elif cluster_selection_scheme == "MostIdleCores":
        return sorted(candidate_clusters, key=lambda x: compute_resources[x]["num_idle_cores"])[-1]
    else:
        raise Exception(f"Unknown cluster selection scheme: {cluster_selection_scheme}")


def schedule_tasks(simulation: Simulation, tasks_to_schedule: List[Task],
                   compute_resources: Dict[ComputeService, Dict[str, float]], storage_service,
                   task_selection_scheme: str, cluster_selection_scheme: str):
    """
    A method that schedules tasks, using list scheduling, if possible
    """

    while True:
        # If no tasks left to schedule, we're done
        if len(tasks_to_schedule) == 0:
            break

        # Pick one of the tasks for scheduling
        task_to_schedule = pick_task_to_schedule(tasks_to_schedule, task_selection_scheme)
        if task_to_schedule is None:
            break

        # Pick one of the compute services on which to schedule the task,
        # using the minimum number of cores for the task

        # task_min_num_cores = task_to_schedule.get_min_num_cores()
        task_min_num_cores = 1
        target_cs = pick_target_cs(compute_resources, task_min_num_cores, cluster_selection_scheme)

        # If we didn't find a compute service, we're done
        if target_cs is None:
            break

        # Remove the task from future consideration
        tasks_to_schedule.remove(task_to_schedule)

        print(f"Scheduling task {task_to_schedule.get_name()} on compute service {target_cs.get_name()}...")

        # Create the dictionary of file locations, which in this case
        # is always the one storage service
        input_files = task_to_schedule.get_input_files()
        output_files = task_to_schedule.get_output_files()
        locations = {}
        for f in input_files:
            locations[f] = storage_service
        for f in output_files:
            locations[f] = storage_service

        # Create a standard job for the task
        job = simulation.create_standard_job([task_to_schedule], locations)

        # Submit the standard job for execution
        target_cs.submit_standard_job(job)

        # Update the number of idle cores of the target compute service
        compute_resources[target_cs]["num_idle_cores"] -= 1


def do_simulation(request_platform_xml,
                  cluster_specs,
                  user_host,
                  task_selection_scheme, cluster_selection_scheme, wf_instance):

    print(f"Instantiating a simulation...")
    simulation = Simulation()

    print(f"Starting the simulation using the XML platform file...")
    simulation.start(request_platform_xml, user_host)

    # Start a storage service on the user host
    print(f"Starting a storage service...")
    ss = simulation.create_simple_storage_service(user_host, ["/"])

    # Create bare-metal compute service on clusters based on cluster specs
    running_bmcss = []
    compute_resources: dict[ComputeService, dict] = {}
    bmcs_to_cluster_map = {}

    print(f"Creating {len(cluster_specs)} compute services...")
    # print(cluster_specs)
    for cluster_id, cluster_spec in cluster_specs.items():
        num_compute_hosts = cluster_spec["computeNodes"]
        num_cores_per_compute_hosts = cluster_spec["cores"]
        core_speed = cluster_spec["speed"]
        link_bandwidth = cluster_spec["bw"]

        head_host = cluster_id+"-0.me"
        compute_host_names = [cluster_id+"-"+str(i)+".me" for i in range(cluster_spec["computeNodes"])]
        compute_host_specs = {}
        for compute_host_name in compute_host_names:
            compute_host_specs[compute_host_name] = (-1, -1)
        bmcs = simulation.create_bare_metal_compute_service(head_host, compute_host_specs, "", {}, {})
        running_bmcss.append(bmcs)
        bmcs_to_cluster_map[bmcs.get_name()] = int(cluster_id)
        compute_resources[bmcs] = {"num_idle_cores": num_compute_hosts * num_cores_per_compute_hosts,
                                   "core_speed": core_speed,
                                   "link_bandwidth": link_bandwidth}

    # Import the workflow from JSON
    print(f"Importing the workflow from JSON...")
    workflow = simulation.create_workflow_from_json(wf_instance,
                                                    reference_flop_rate="100Gf",
                                                    ignore_machine_specs=True,
                                                    redundant_dependencies=False,
                                                    ignore_cycle_creating_dependencies=False,
                                                    min_cores_per_task=1,
                                                    max_cores_per_task=1,
                                                    enforce_num_cores=True,
                                                    ignore_avg_cpu=True,
                                                    show_warnings=True)

    num_tasks = len(workflow.get_tasks())

    # Create all needed files on the storage service
    print(f"Create all file copies on the storage service...")
    files = workflow.get_input_files()
    for f in files:
        ss.create_file_copy(f)

    events = []
    # We are now ready to schedule the workflow
    print(f"Starting my main loop!")
    num_completed_tasks = 0

    while num_completed_tasks < num_tasks:
        # Perform some scheduling, perhaps
        schedule_tasks(simulation, workflow.get_ready_tasks(), compute_resources, ss,
                       task_selection_scheme, cluster_selection_scheme)

        # Wait for next event
        event = simulation.wait_for_next_event()
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
            num_completed_tasks += 1

    print(f"Workflow execution completed at time {simulation.get_simulated_time()}!")
    # print(f"Workflow execution events {events}!")
    simulation_events = events

    return simulation_events
