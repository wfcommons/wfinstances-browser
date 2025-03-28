// import { Simulation } from './Simulation'
// import {useQuery} from "@tanstack/react-query";

// let xmlString = `<?xml version='1.0'?>
// <!DOCTYPE platform SYSTEM "https://simgrid.org/simgrid.dtd">
// <platform version="4.1">
//   <zone id="world" routing="Full">

//     <zone id="outside" routing="None">
//       <host id="UserHost" speed="1Gf">
//         <disk id="hard_drive" read_bw="100MBps" write_bw="100MBps">
//           <prop id="size" value="5000GiB"/>
//           <prop id="mount" value="/"/>
//         </disk>
//       </host>
//     </zone>

//     <cluster id="datacenter1" prefix="c-" suffix=".me" radical="0-15" speed="1Gf" bw="125MBps" lat="50us"
//              router_id="router1" core="1"/>

//     <cluster id="datacenter2" prefix="d-" suffix=".me" radical="0-63" speed="2Gf" bw="125MBps" lat="50us"
//              router_id="router2" core="1"/>

//     <cluster id="datacenter3" prefix="e-" suffix=".me" radical="0-31" speed="3Gf" bw="125MBps" lat="50us"
//              router_id="router3" core="1"/>


//     <link id="link1" bandwidth="400kBps" latency="10ms"/>
//     <link id="link2" bandwidth="100kBps" latency="10ms"/>
//     <link id="link3" bandwidth="300kBps" latency="10ms"/>

//     <zoneRoute src="datacenter1" dst="outside" gw_src="router1" gw_dst="UserHost">
//       <link_ctn id="link1"/>
//     </zoneRoute>
//     <zoneRoute src="datacenter2" dst="outside" gw_src="router2" gw_dst="UserHost">
//       <link_ctn id="link2"/>
//     </zoneRoute>
//     <zoneRoute src="datacenter3" dst="outside" gw_src="router3" gw_dst="UserHost">
//       <link_ctn id="link3"/>
//     </zoneRoute>


//   </zone>
// </platform>`

export async function simulate(client_ip, id, xmlData) {

    // Send simulation request to the api backend
    const spec = {
        "client_ip": client_ip,
        "platform_spec": xmlData.platformSpec,
        "task_selection_scheme": xmlData.taskSelectionScheme,
        "cluster_selection_scheme": xmlData.clusterSelectionScheme,
        "controller_hostname": "UserHost"
    };

    const r = await fetch(`/wf-instances/public/simulate/${id}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'text/plain',
        },
        body: JSON.stringify(spec),
    });

    //handle errors
    const response = await r.json()
    return response
}
