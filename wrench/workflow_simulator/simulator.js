import { Task } from "wrench.task"
import { Simulation } from "wrench.simulation"
import { ComputeService } from "wrench.compute_service"


function main() {
    console.log("Instantiating a simulation...");
    simulation = wrench.Simulation();
    console.log("Starting the simulation using the XML platform file...");
    simulation.start("one_host_and_several_clusters.xml", "UserHost");
    console.log(`Workflow execution completed at time ${simulation.getSimulatedTime()}!`);
    simulation.sleep(10);
    console.log(`Workflow execution completed at time ${simulation.getSimulatedTime()}!`);
}