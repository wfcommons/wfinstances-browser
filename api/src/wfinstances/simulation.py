from wrench.simulation import Simulation
from wrench.task import Task 
from wrench.compute_service import ComputeService 
from typing import List, Dict

def pick_task_to_schedule(tasks: List[Task]):
    """
    A method to select a particular task to schedule. Right now, just selects
    the task with the largest flop
    """
    # pick the task with the largest flop amount
    target_task = tasks[0]
    max_flop = target_task.get_flops()
    for task in tasks[1:]:
        if task.get_flops() > max_flop:
            max_flop = task.get_flops()
            target_task = task
    return target_task


def pick_target_cs(compute_resources: Dict[ComputeService, Dict[str, float]], desired_num_cores: int) -> ComputeService:
    """
    A method to select a compute service on which to schedule a task. Right now,
    just selects the compute service with the largest flop rate
    """
    # pick the one with the largest core speed
    max_core_speed = 0
    target_cs = None
    for cs in compute_resources:
        # If there are no idle cores, don't consider this resource
        if compute_resources[cs]["num_idle_cores"] < desired_num_cores:
            continue
        if compute_resources[cs]["core_speed"] > max_core_speed:
            max_core_speed = compute_resources[cs]["core_speed"]
            target_cs = cs
    return target_cs


def schedule_tasks(simulation: Simulation, tasks_to_schedule: List[Task],
                   compute_resources: Dict[ComputeService, Dict[str, float]], storage_service):
    """
    A method that schedules tasks, using list scheduling, if possible
    """

    while True:
        # If no tasks left to schedule, we're done
        if len(tasks_to_schedule) == 0:
            break

        # Pick one of the tasks for scheduling
        task_to_schedule = pick_task_to_schedule(tasks_to_schedule)
        if task_to_schedule is None:
            break

        # Pick one of the compute services on which to schedule the task,
        # using the minimum number of cores for the task
        target_cs = pick_target_cs(compute_resources, task_to_schedule.get_min_num_cores())

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

    return
