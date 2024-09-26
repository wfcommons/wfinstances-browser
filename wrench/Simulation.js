export class Simulation {
  constructor(daemon_host = "wrench", daemon_port = 2345 ) {
    this.daemon_host = daemon_host;
    this.daemon_port = daemon_port;
    this.daemon_url = `http://${daemon_host}:${daemon_port}`;
    this.started = false;

    this.terminated = false;
    this.spec = null;

    this.simid = 101;
  }

  // __send_request_to_daemon(requests_method, route, json_data) {
  //   try {
  //     const r = requests_method(route, json_data);
  //     return r;
  //   } catch (e) {
  //     throw WRENCHException("Connection to wrench-daemon severed: " + e.toString() + "\n");
  //   }
  // }

  async start(platform_file_path, controller_hostname) {
    if(this.terminated) {
      console.error("The simulation has been terminated.");
    }

    if (!this.started) {

      //read in xml file
      fetch('path/to/local/file.xml')
        .then(response => response.text())
        .catch(error => console.error('Error fetching XML file:', error));


      //connect to WRENCH daemon
      this.spec = { "platform_xml": xml, "controller_hostname": controller_hostname };
      const r = await fetch(`${this.daemon_url}/${this.simid}/getTime`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(this.spec),
      });

      //handle errors
      const response = r.json()
      if (!response.wrench_api_request_success) {
        this.terminated = true;
        console.error("Failed to start");
        console.error(response.failure_cause);
      }
      this.daemon_port = response["port_number"];
      this.daemon_url = `http://${this.daemon_host}:${this.daemon_port}/simulation`;
      this.started = true;
    }
  }

  // async sleep(seconds) {
  //   const data = { increment: seconds };
  //   this.__send_request_to_daemon(requests.post, `${this.daemon_url}/${this.simid}/advanceTime`, data);
  // }

  async sleep(seconds) {
    const data = { increment: seconds };

    await fetch(`${this.daemon_url}/${this.simid}/advanceTime`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
  }

  // get_simulated_time() {
  //   const r = this.__send_request_to_daemon(requests.get, `${this.daemon_url}/${this.simid}/getTime`, {});

  //   const response = r.json();
  //   return response["time"];
  // }

  async get_simulated_time() {
    const response = await fetch(`${this.daemon_url}/${this.simid}/getTime`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // if (!response.ok) {
    //   throw new Error("Error fetching simulated time.");
    // }

    const data = await response.json();
    return data.time;
  }

}