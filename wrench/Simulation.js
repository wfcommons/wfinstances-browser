import { BareMetalComputeService } from "wrench.bare_metal_compute_service"
import { BatchComputeService } from "wrench.batch_compute_service"
import { CloudComputeService } from "wrench.cloud_compute_service"
import { ComputeService } from "wrench.compute_service"
import { WRENCHException } from "wrench.exception"
import { File } from "wrench.file"
import { FileRegistryService } from "wrench.file_registry_service"
import { StandardJob } from "wrench.standard_job"
import { CompoundJob } from "wrench.compound_job"
import { Action } from "wrench.action"
import { SleepAction } from "wrench.sleep_action"
import { ComputeAction } from "wrench.compute_action"
import { FileCopyAction } from "wrench.file_copy_action"
import { FileDeleteAction } from "wrench.file_delete_action"
import { FileWriteAction } from "wrench.file_write_action"
import { FileReadAction } from "wrench.file_read_action"
import { StorageService } from "wrench.storage_service"
import { Task } from "wrench.task"
import { VirtualMachine } from "wrench.virtual_machine"
import { Workflow } from "wrench.workflow"

class Simulation {
  constructor(daemon_host = "localhost", daemon_port = 2345 ) {
    this.daemon_host = daemon_host;
    this.daemon_port = daemon_port;
    this.daemon_url = `http://${daemon_host}:${daemon_port}`;
    this.started = false;

    atexit.register(this.terminate);
    this.terminated = false;
    this.spec = null;

    this.tasks = {};
    this.actions = {};
    this.standard_jobs = {};
    this.compound_jobs = {};
    this.files = {};
    this.compute_services = {};
    this.storage_services = {};
    this.file_registry_services = {};

    this.simid = 101;
  }

  start(platform_file_path, controller_hostname) {
    if(this.terminated) {
      raise WRENCHException("This simulation has been terminated.");
    }

    if (!this.started) {
      try {
        with (open(platform_file_path, "r") as platform_file) {xml = platform_file.read()};
      }
      catch(e) {
        raise WRENCHException(`Cannot read platform file '${platform_file_path.absolute().name}' (${e.toString()})`);
      }
    }
    this.spec = {"platform_xml": xml, "controller_hostname": controller_hostname};
    try {
      const r = requests.post(`${this.daemon_url}/startSimulation`, json = this.spec)
    }
    catch(e) {
      raise WRENCHException(`Cannot connect to WRENCH daemon (${this.daemon_host}:${this.daemon_port}). Perhaps it needs to be started?`)
    }

    const response = r.json()
    if (!response["wrench_api_request_success"]) {
      this.terminated = true;
      raise WRENCHException(response["failure_cause"]);
    }
      this.daemon_port = response["port_number"];
      this.daemon_url = `http://${this.daemon_host}:${this.daemon_port}/simulation`;
      this.started = true;
  else
    {
      pass;
    }
  }

  __send_request_to_daemon(requests_method, route, json_data) {
    try {
      const r = requests_method(route, json = json_data);
      return r;
    } catch (e) {
      raise WRENCHException("Connection to wrench-daemon severed: " + e.toString() + "\n");
    }
  }

  get_simulated_time() {
    const r = this.__send_request_to_daemon(requests.get, `${this.daemon_url}/${this.simid}/getTime`, json_data = {});

    const response = r.json();
    return response["time"];
  }
}