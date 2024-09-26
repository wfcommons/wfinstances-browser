import { Task } from "wrench.task"
import { Simulation } from '/wrench/Simulation'
import { ComputeService } from "wrench.compute_service"


export function simulate() {
    console.log("Instantiating a simulation...");
    let simulation = new Simulation();
    console.log("Starting the simulation using the XML platform file...");
    simulation.start('/one_host_and_several_clusters.xml', "UserHost");
    console.log(`Workflow execution completed at time ${simulation.get_simulated_time()}!`);
    simulation.sleep(10);
    console.log(`Workflow execution completed at time ${simulation.get_simulated_time()}!`);
}