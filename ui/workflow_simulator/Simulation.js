let xmlString = `<?xml version='1.0'?>
<!DOCTYPE platform SYSTEM "https://simgrid.org/simgrid.dtd">
<platform version="4.1">
  <zone id="world" routing="Full">

    <zone id="outside" routing="None">
      <host id="UserHost" speed="1Gf">
        <disk id="hard_drive" read_bw="100MBps" write_bw="100MBps">
          <prop id="size" value="5000GiB"/>
          <prop id="mount" value="/"/>
        </disk>
      </host>
    </zone>

    <cluster id="datacenter1" prefix="c-" suffix=".me" radical="0-15" speed="1Gf" bw="125MBps" lat="50us"
             router_id="router1" core="1"/>

    <cluster id="datacenter2" prefix="d-" suffix=".me" radical="0-63" speed="2Gf" bw="125MBps" lat="50us"
             router_id="router2" core="1"/>

    <cluster id="datacenter3" prefix="e-" suffix=".me" radical="0-31" speed="3Gf" bw="125MBps" lat="50us"
             router_id="router3" core="1"/>


    <link id="link1" bandwidth="400kBps" latency="10ms"/>
    <link id="link2" bandwidth="100kBps" latency="10ms"/>
    <link id="link3" bandwidth="300kBps" latency="10ms"/>

    <zoneRoute src="datacenter1" dst="outside" gw_src="router1" gw_dst="UserHost">
      <link_ctn id="link1"/>
    </zoneRoute>
    <zoneRoute src="datacenter2" dst="outside" gw_src="router2" gw_dst="UserHost">
      <link_ctn id="link2"/>
    </zoneRoute>
    <zoneRoute src="datacenter3" dst="outside" gw_src="router3" gw_dst="UserHost">
      <link_ctn id="link3"/>
    </zoneRoute>


  </zone>
</platform>`
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
            // let reader = new FileReader();
            // reader.readAsText('./one_host_and_several_clusters.xml')
            // reader.onload = function(e) {
            //     let xml = e.target.result; // Store the file content as a string
            //     this.spec = { "platform_xml": xml, "controller_hostname": controller_hostname };
            // };

            // fetch('./one_host_and_several_clusters.xml')
            //     .then(response => response.text())
            //     .then(xmlString => {
            //         let xml = xmlString;
            //         this.spec = { "platform_xml": xml, "controller_hostname": controller_hostname };
            //     })
            //     .catch(error => console.error('Error fetching XML file:', error));

            this.spec = { "platform_xml": xmlString, "controller_hostname": controller_hostname };

            //connect to WRENCH daemon
            const r = await fetch(`${this.daemon_url}/startSimulation`, {
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

        if (!response.ok) {
            console.error("Error fetching simulated time.");
        }

        const data = await response.json();
        return data.time;
    }

}