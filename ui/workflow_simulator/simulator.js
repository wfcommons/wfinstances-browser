import { Simulation } from './Simulation'


export async function simulate() {
    console.log("Instantiating a simulation...");
    let simulation = new Simulation();
    console.log("Starting the simulation using the XML platform file...");
    await simulation.start('/one_host_and_several_clusters.xml', "UserHost");
    console.log("Simulation started...");
    let simulation_time = await simulation.get_simulated_time();
    console.log("Simulation time: " + simulation_time);
    console.log("Sleeping for 10 seconds...");
    await simulation.sleep(10);
    simulation_time = await simulation.get_simulated_time();
    console.log("Simulation time: " + simulation_time);
}
