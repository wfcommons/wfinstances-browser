import {Button, Group, Modal, Table, Title, NumberInput, ActionIcon, Slider, Text, Tooltip} from '@mantine/core';
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
        { cluster: 1, bw: 400, latency: 10, computeNode: 16, core: 1, speed: 1},
        { cluster: 2, bw: 100, latency: 10, computeNode: 64, core: 1, speed: 2},
        { cluster: 3, bw: 300, latency: 10, computeNode: 32, core: 1, speed: 3},
    ])
    const [readBandwidth, setReadBandwidth] = useState(100);
    const [writeBandwidth, setWriteBandwidth] = useState(100);

    const [newCluster, increaseCluster] = useState(elements.length+1)

    const addRow = () => {
        increaseCluster(newCluster + 1);// Increment cluster number
        const newElement = { cluster: newCluster, bw: 100, latency: 10, computeNode: 32, core: 1, speed: 1 };
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
        console.log(clusterData);
        return clusterData;
    };

    // Function to generate the XML string based on the cluster data
    // const generateXML = (clusterData) => {
    //     let xmlString = `<?xml version='1.0'?>
    //         <!DOCTYPE platform SYSTEM "https://simgrid.org/simgrid.dtd">
    //         <platform version="4.1">
    //           <zone id="world" routing="Full">
    //
    //             <zone id="outside" routing="None">
    //               <host id="UserHost" speed="1Gf">
    //                 <disk id="hard_drive" read_bw="${clusterData.readBandwidth}MBps" write_bw="${clusterData.writeBandwidth}MBps">
    //                   <prop id="size" value="5000GiB"/>
    //                   <prop id="mount" value="/"/>
    //                 </disk>
    //               </host>
    //             </zone>`;
    //
    //     // Loop through the clusters and add them to the XML string
    //     Object.entries(clusterData.clusters).forEach(([id, values]) => {
    //         xmlString += `
    //             <cluster id="datacenter${id}" prefix="c-" suffix=".me" radical="0-${values.computeNodes-1}" speed="${values.speed}Gf" bw="125MBps" lat="50us" router_id="router${id}" core="${values.cores}"/>`;
    //     });
    //
    //     // Loop through the clusters and add them to the XML string
    //     Object.entries(clusterData.clusters).forEach(([id, values]) => {
    //         xmlString += `
    //             <link id="link${id}" bandwidth="${values.bw}kBps" latency="${values.latency}ms"/>`;
    //     });
    //
    //     Object.entries(clusterData.clusters).forEach(([id, values]) => {
    //         xmlString += `
    //             <zoneRoute src="datacenter${id}" dst="outside" gw_src="router${id}" gw_dst="UserHost">
    //               <link_ctn id="link${id}"/>
    //             </zoneRoute>`
    //     });
    //
    //     xmlString += `
    //           </zone>
    //         </platform>`;
    //     return xmlString; // Return the generated XML string
    // };

    // Combined function to run simulation and get data
    const handleRunSimulation = () => {
        const data = getData(); // Call getData to get the current state
        //const xmlString = generateXML(data); // Generate the XML string
        //console.log(xmlString); // Log the XML string or use it as needed
        simulate(id, data); // Call the simulate function with the id
    };
    // Generate table rows with input fields
    const rows = elements.map((element, index) => (
        <tr key={element.cluster}>
            <td style={{ width: 'auto', padding: '2px', textAlign: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ActionIcon color="red" onClick={() => deleteRow(index)}>
                        <Tooltip label="Delete Cluster"><IconTrash size={16} /></Tooltip>
                    </ActionIcon>
                </div>
            </td>
            <td key='bw'>
                <NumberInput
                    value={element['bw']}
                    onChange={(value) => updateElement(index, 'bw', value)}
                    defaultValue='bw'
                    size="xs"
                    suffix="kBps"
                    min={50}
                    max={1000}
                />
                <Slider
                    value={element['bw']}
                    onChange={(value) => updateElement(index, 'bw', value)}
                    defaultValue='bw'
                    min={50}
                    max={1000}
                    step={50}
                    label={(value) => `${value} kBps`} />
            </td>
            <td key='latency'>
                <NumberInput
                    value={element['latency']}
                    onChange={(value) => updateElement(index, 'latency', value)}
                    defaultValue='latency'
                    size="xs"
                    suffix="ms"
                    min={1}
                    max={100}
                />
                <Slider value={element['latency']}
                    onChange={(value) => updateElement(index, 'latency', value)}
                    defaultValue='latency'
                    min={1}
                    max={100}
                    step={1}
                    label={(value) => `${value} ms`} />
            </td>
            <td key='computeNode'>
                <NumberInput
                    value={element['computeNode']}
                    onChange={(value) => updateElement(index, 'computeNode', value)}
                    defaultValue='computeNode'
                    size="xs"
                    min={1}
                    max={10}
                />
                <Slider
                    value={element['computeNode']}
                    onChange={(value) => updateElement(index, 'computeNode', value)}
                    defaultValue='computeNode'
                    min={1}
                    max={10}
                    step={1} />
            </td>
            <td key='core'>
                <NumberInput
                    value={element['core']}
                    onChange={(value) => updateElement(index, 'core', value)}
                    defaultValue='core'
                    size="xs"
                    min={16}
                    max={256}
                />
                <Slider
                    value={element['core']}
                    onChange={(value) => updateElement(index, 'core', value)}
                    defaultValue='core'
                    min={16}
                    max={256}
                    step={1} />
            </td>
            <td key='speed'>
                <NumberInput
                    value={element['speed']}
                    onChange={(value) => updateElement(index, 'speed', value)}
                    defaultValue='speed'
                    size="xs"
                    suffix="Gflop/sec"
                    min={1}
                    max={10}
                />
                <Slider
                    value={element['speed']}
                    onChange={(value) => updateElement(index, 'speed', value)}
                    defaultValue='speed'
                    min={1}
                    max={10}
                    step={1}
                    label={(value) => `${value} Gflop/sec`} />
            </td>
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
                <div>
                    <Table justify="left">
                        <Table.Tbody>
                            <tr>
                                <td width="auto" valign="top">
                                    <Text px={10}>Read Bandwidth of the Disk on the Controller Host:  </Text>
                                </td>
                                <td width="auto">
                                    <NumberInput
                                        defaultValue={100}
                                        min={50}
                                        max={1000}
                                        size="xs"
                                        suffix="MBps"
                                        value={readBandwidth}
                                        onChange={setReadBandwidth}  />
                                    <Slider
                                        value={readBandwidth}
                                        onChange={setReadBandwidth}
                                        defaultValue={100}
                                        min={50}
                                        max={1000}
                                        step={50}
                                        label={(value) => `${value} MBps`} />
                                </td>
                            </tr>
                            <tr></tr>
                            <tr>
                                <td width="auto" valign="top">
                                    <Text px={10}>Write Bandwidth of the Disk on the Controller Host:  </Text>
                                </td>
                                <td width="auto">
                                    <NumberInput
                                        defaultValue={100}
                                        min={50}
                                        max={1000}
                                        size="xs"
                                        suffix="MBps"
                                        value={writeBandwidth}
                                        onChange={setWriteBandwidth}  />
                                    <Slider
                                        value={writeBandwidth}
                                        onChange={setWriteBandwidth}
                                        defaultValue={100}
                                        min={50}
                                        max={1000}
                                        step={50}
                                        label={(value) => `${value} MBps`} />
                                </td>
                                <td></td>
                            </tr>
                        </Table.Tbody>
                    </Table>
                </div>
            </Group>
            <Group justify="center" pt={15}>
                <Button variant="success" onClick={handleRunSimulation}>Run Simulation</Button>
            </Group>
        </Modal>
    );
}
