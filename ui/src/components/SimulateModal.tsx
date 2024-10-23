import {Button, Group, Modal, Table, Title, NumberInput, ActionIcon, Text} from '@mantine/core';
import { IconTrash } from '@tabler/icons-react';
import {simulate} from '../../workflow_simulator/simulator';
import {useState} from "react";

export function SimulateModal({
    id,
    opened,
    onClose
}: { 
    id: string,
    opened: boolean,
    onClose: () => void
}) {
    const [elements, setElements] = useState([
        { cluster: 1, bw: 400, latency: 10, computeNode: 1, core: 16, speed: 1},
        { cluster: 2, bw: 100, latency: 10, computeNode: 1, core: 64, speed: 2},
        { cluster: 3, bw: 300, latency: 10, computeNode: 1, core: 32, speed: 3},
    ])
    const [readBandwidth, setReadBandwidth] = useState(0);
    const [writeBandwidth, setWriteBandwidth] = useState(0);

    const addRow = () => {
        const newCluster = elements.length + 1; // Increment cluster number
        const newElement = { cluster: newCluster, bw: 100, latency: 10, computeNode: 1, core: 32, speed: 1 };
        setElements([...elements, newElement]); // Add new element to state
    };
    const deleteRow = (index) => {
        const updatedElements = elements.filter((_, i) => i !== index); // Remove the row at the given index
        setElements(updatedElements);
    };

    // Function to handle input change in the table
    const updateElement = (index, field, value) => {
        const updatedElements = elements.map((element, i) =>
            (i === index ? { ...element, [field]: value } : element)
        );
        setElements(updatedElements);
    };
    // New getData function
    const getData = () => {
        const clusterData = {
            readBandwidth,
            writeBandwidth,
            clusters: {},
        };
        elements.forEach((element, index) => {
            const values = {
                "bw": element.bw,
                "latency": element.latency,
                "computeNodes": element.computeNode,
                "cores": element.core,
                "speed": element.speed
            };
            clusterData.clusters[(index + 1).toString()] = values; // Index is 0-based, so +1
        });
        return clusterData;
    };

    // Function to generate the XML string based on the cluster data
    const generateXML = (clusterData) => {
        let xmlString = `<?xml version='1.0'?>
            <!DOCTYPE platform SYSTEM "https://simgrid.org/simgrid.dtd">
            <platform version="4.1">
              <zone id="world" routing="Full">

                <zone id="outside" routing="None">
                  <host id="UserHost" speed="1Gf">
                    <disk id="hard_drive" read_bw="${clusterData.readBandwidth}MBps" write_bw="${clusterData.writeBandwidth}MBps">
                      <prop id="size" value="5000GiB"/>
                      <prop id="mount" value="/"/>
                    </disk>
                  </host>
                </zone>`;

        // Loop through the clusters and add them to the XML string
        Object.entries(clusterData.clusters).forEach(([id, values]) => {
            xmlString += `
                <cluster id="datacenter${id}" prefix="c-" suffix=".me" radical="${values.computeNodes}" speed="${values.speed}Gf" bw="125MBps" lat="50us" router_id="router${id}" core="${values.cores}"/>`;
        });

        // Loop through the clusters and add them to the XML string
        Object.entries(clusterData.clusters).forEach(([id, values]) => {
            xmlString += `
                <link id="link${id}" bandwidth="${values.bw}kBps" latency="${values.latency}ms"/>`;
        });

        Object.entries(clusterData.clusters).forEach(([id, values]) => {
            xmlString += `
                <zoneRoute src="datacenter${id}" dst="outside" gw_src="router${id}" gw_dst="UserHost">
                  <link_ctn id="link${id}"/>
                </zoneRoute>`
        });

        xmlString += `
              </zone>
            </platform>`;
        return xmlString; // Return the generated XML string
    };

    // Combined function to run simulation and get data
    const handleRunSimulation = () => {
        const data = getData(); // Call getData to get the current state
        const xmlString = generateXML(data); // Generate the XML string
        console.log(xmlString); // Log the XML string or use it as needed
        simulate(id, xmlString); // Call the simulate function with the id
    };
    // Generate table rows with input fields
    const rows = elements.map((element, index) => (
        <tr key={element.cluster}>
            <td style={{ width: 'auto', padding: '2px', textAlign: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ActionIcon color="red" onClick={() => deleteRow(index)}>
                        <IconTrash size={16} />
                    </ActionIcon>
                </div>
            </td>
            {['bw', 'latency', 'computeNode', 'core', 'speed'].map((field) => (
                <td key={field}>
                    <NumberInput
                        value={element[field]}
                        onChange={(value) => updateElement(index, field, value)}
                        placeholder={field}
                        size="xs"
                        min={0}
                    />
                </td>
            ))}
        </tr>
    ));

    return (
        <Modal title="WfInstance Simulation" opened={opened} onClose={onClose} size='100%'>
            <i>{id}</i>
            <Group justify="center">
                <Title order={4}>Input Compute Platform XML Specifications</Title>
                <Table striped highlightOnHover withTableBorder withColumnBorders>
                    <Table.Thead>
                        <Table.Tr>
                            <Table.Th>Cluster</Table.Th>
                            <Table.Th>Link Bandwidth</Table.Th>
                            <Table.Th>Link Latency</Table.Th>
                            <Table.Th>Compute Nodes</Table.Th>
                            <Table.Th>Cores per Compute Nodes</Table.Th>
                            <Table.Th>Core Speed (GFlop/sec)</Table.Th>
                        </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>{rows}</Table.Tbody>
                </Table>
                <Button variant="default" onClick={addRow}>Add Cluster</Button>
            </Group>
            <Group justify="flex-start" pt={15}>
                <Text>Read Bandwdith of the Disk on the Controller Host:</Text>
                <NumberInput min={0} size="sm" value={readBandwidth} onChange={setReadBandwidth} />
            </Group>
            <Group justify="flex-start" pt={15}>
                <Text>Write Bandwdith of the Disk on the Controller Host:</Text>
                <NumberInput min={0} size="sm" value={writeBandwidth} onChange={setWriteBandwidth}/>
            </Group>
            <Group justify="center" pt={15}>
                <Button variant="default" onClick={handleRunSimulation}>Run Simulation</Button>
            </Group>
        </Modal>
    );
}
