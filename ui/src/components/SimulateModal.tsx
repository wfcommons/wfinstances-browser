import {Button, Group, Modal, Table, Title, NumberInput, ActionIcon, Slider, Text, Tooltip, Tabs, UnstyledButton, rem, Input, Loader} from '@mantine/core';
import {IconPlus, IconTrash, IconX} from '@tabler/icons-react';
import {simulate} from '../../workflow_simulator/simulator';
import { SimulationGraph } from '~/components/SimulationGraph';
import React, {useState} from "react";
import loadable from '@loadable/component';

const Chart = loadable(() => import('react-apexcharts'), {
    ssr: false,
    resolveComponent: (components: any) => components.default['default'] as any,
});
export function SimulateModal({
    id,
    opened,
    onClose
}: {
  id: string,
  opened: boolean,
  onClose: () => void
}) {

    const initialElements = [
        { cluster: 1, bw: 400, latency: 10, computeNode: 16, core: 1, speed: 1},
        { cluster: 2, bw: 100, latency: 10, computeNode: 64, core: 1, speed: 2},
        { cluster: 3, bw: 300, latency: 10, computeNode: 32, core: 1, speed: 3},
    ];
    const initialReadBandwidth = 100;
    const initialWriteBandwidth = 100;

    const defaultTitle = "New Experiment";
  
    const [tabs, setTabs] = useState([
        { id: '1',
            data: JSON.parse(JSON.stringify(initialElements)),
            read: JSON.parse(JSON.stringify(initialReadBandwidth)),
            write: JSON.parse(JSON.stringify(initialWriteBandwidth)),
            title: JSON.parse(JSON.stringify(defaultTitle))
        },
    ]);
    const [tabTracker, increaseTracker] = useState(tabs.length+1);

    // Track the currently active tab
    const [activeTab, setActiveTab] = useState('1');

    //Add a new tab
    const addTab = () => {
        increaseTracker(tabTracker + 1);
        const newId = (tabTracker).toString();
        const newTab = {
            id: newId,
            data: JSON.parse(JSON.stringify(initialElements)),
            read: JSON.parse(JSON.stringify(initialReadBandwidth)),
            write: JSON.parse(JSON.stringify(initialWriteBandwidth)),
            title: JSON.parse(JSON.stringify(defaultTitle))
        };
        setTabs([...tabs, newTab]);
        setActiveTab(newId); // Set focus on the new tab
    };

    //Remove a tab
    const removeTab = (id) => {
        setTabs(tabs.filter((tab) => tab.id !== id));
        setActiveTab(tabs.length > 1 ? tabs[0].id : '');
    };

    const updateElementsTabData = (id, newData) => {
        setTabs(tabs.map(tab =>
            (tab.id === id ? { ...tab, data: newData } : tab)
        ));
    };
    
    const updateReadBandwidthTabData = (id, newData) => {
        setTabs(tabs.map(tab =>
            (tab.id === id ? { ...tab, read: newData } : tab)
        ));
    }

    const updateWriteBandwidthTabData = (id, newData) => {
        setTabs(tabs.map(tab =>
            (tab.id === id ? { ...tab, write: newData } : tab)
        ));
    }
    
    const updateTitleTabData = (id, newData) => {
        setTabs(tabs.map(tab =>
            (tab.id === id ? { ...tab, title: newData } : tab)
        ));
    }

    const iconStyle = { width: rem(12), height: rem(12) };
    return (
        <Modal title="WfInstance Simulation" opened={opened} onClose={onClose} size='100%'>
            <i>{id}</i>
            <Tabs defaultValue="1" variant="outline">
                <Tabs.List pt={15}>
                    {tabs.map((tab) => (
                        <Tabs.Tab key={tab.id} value={tab.id} rightSection={<UnstyledButton
                            onClick={(e) => {
                                e.stopPropagation();
                                removeTab(tab.id);
                            }}>
                            <IconX style={iconStyle} />
                        </UnstyledButton>}>
                            <Text mx={0} size="sm"
                                style={{
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                    maxWidth: '14ch', // Limits text display to approximately 14 characters
                                }}>
                                {tab.title}
                            </Text>
                        </Tabs.Tab>
                    ))}
                    <Tooltip label={"Add Cluster"}>
                        <UnstyledButton ml={5} onClick={addTab}><IconPlus style={iconStyle} /></UnstyledButton>
                    </Tooltip>
                </Tabs.List>
                {tabs.map((tab) => (
                    <Tabs.Panel key={tab.id} value={tab.id}>
                        <NewTab 
                            tabData={initialElements} 
                            tabReadBandwidth={initialReadBandwidth} 
                            tabWriteBandwidth={initialWriteBandwidth} 
                            onElementChange={(newData) => updateElementsTabData(tab.id, newData)}
                            onReadBandwidthChange={(newData) => updateReadBandwidthTabData(tab.id, newData)}
                            onWriteBandwidthChange={(newData) => updateWriteBandwidthTabData(tab.id, newData)}
                            onTitleChange={(newData) => updateTitleTabData(tab.id, newData)}
                            id={id}
                        />
                    </Tabs.Panel>
                ))}
            </Tabs>
        </Modal>


    );
}

function NewTab ({
    tabData, 
    tabReadBandwidth, 
    tabWriteBandwidth,
    tabTitle,
    onElementChange, 
    onReadBandwidthChange, 
    onWriteBandwidthChange,
    onTitleChange,
    id
}) {

    const bwMin = 50, bwMax = 1000, bwStep = 50;
    const latencyMin = 1, latencyMax = 100, latencyStep = 1;
    const computeNodeMin = 1, computeNodeMax = 256, computeNodeStep = 1;
    const coreMin = 1, coreMax = 10, coreStep = 1;
    const speedMin = 1, speedMax = 10, speedStep = 1;
    const readBandwidthMin = 50, readBandwidthMax = 1000, readBandwidthStep = 50;
    const writeBandwidthMin = 50, writeBandwidthMax = 1000, writeBandwidthStep = 50;

    interface TaskData {
       task_name: string;
       cluster_index: number;
       scheduled_time: number;
       completion_time: number;
    }
    const [showGraph, setShowGraph] = useState(false); // New state to control graph visibility
    const [graphData, setGraphData] = useState<TaskData[] | null>(null);
    const [loading, setLoading] = useState(false);

    const [elements, setElements] = useState(tabData)

    const [readBandwidth, setReadBandwidth] = useState(tabReadBandwidth);
    const [writeBandwidth, setWriteBandwidth] = useState(tabWriteBandwidth);

    const [title, setTitle] = useState(tabTitle);

    const [newCluster, increaseCluster] = useState(elements.length+1);

    const options = {
        chart: {
            id: 'basic-bar',
        },
        xaxis: {
            categories: [1991, 1992, 1993, 1994, 1995],
        },
    };

    const series = [
        {
            name: 'Series 1',
            data: [30, 40, 45, 50, 49],
        },
    ];


    const addRow = () => {
        increaseCluster(newCluster + 1);// Increment cluster number
        const newElement = { cluster: newCluster, bw: 100, latency: 10, computeNode: 32, core: 1, speed: 1 };
        const updatedElements = [...elements, newElement];
        setElements(updatedElements); // Add new element to state
        onElementChange(updatedElements); //update parent function

    };
    const deleteRow = (index) => {
        const updatedElements = elements.filter((_, i) => i !== index); // Remove the row at the given index
        setElements(updatedElements);
        onElementChange(updatedElements);
    };

    // Function to handle input change in the table
    const updateElement = (index, field, value) => {
        const updatedElements = elements.map((element, i) =>
            (i === index ? { ...element, [field]: value } : element)
        );
        setElements(updatedElements);
        onElementChange(updatedElements);
    };

    const updateReadBandwidth = (value) => {
        setReadBandwidth(value);
        onReadBandwidthChange(value);
    }

    const updateWriteBandwidth = (value) => {
        setWriteBandwidth(value);
        onWriteBandwidthChange(value);
    }

    const updateTitle = (value) => {
        setTitle(value);
        onTitleChange(value);
    }

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

    // Combined function to run simulation and get data
    const handleRunSimulation = async () => {
        setLoading(true); // Show loader
        const data = getData();
        // Pass the simulation data to the simulate function and wait for results
        const results = await simulate(id, data);
        setGraphData(results.result.Runtime);  // Set the data returned from simulation
        setShowGraph(true);  // Display the graph after simulation
        setLoading(false);
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
                    min={bwMin}
                    max={bwMax}
                />
                <Slider
                    value={element['bw']}
                    onChange={(value) => updateElement(index, 'bw', value)}
                    defaultValue='bw'
                    min={bwMin}
                    max={bwMax}
                    step={bwStep}
                    label={(value) => `${value} kBps`} />
            </td>
            <td key='latency'>
                <NumberInput
                    value={element['latency']}
                    onChange={(value) => updateElement(index, 'latency', value)}
                    defaultValue='latency'
                    size="xs"
                    suffix="ms"
                    min={latencyMin}
                    max={latencyMax}
                />
                <Slider value={element['latency']}
                    onChange={(value) => updateElement(index, 'latency', value)}
                    defaultValue='latency'
                    min={latencyMin}
                    max={latencyMax}
                    step={latencyStep}
                    label={(value) => `${value} ms`} />
            </td>
            <td key='computeNode'>
                <NumberInput
                    value={element['computeNode']}
                    onChange={(value) => updateElement(index, 'computeNode', value)}
                    defaultValue='computeNode'
                    size="xs"
                    min={computeNodeMin}
                    max={computeNodeMax}
                />
                <Slider
                    value={element['computeNode']}
                    onChange={(value) => updateElement(index, 'computeNode', value)}
                    defaultValue='computeNode'
                    min={computeNodeMin}
                    max={computeNodeMax}
                    step={computeNodeStep} />
            </td>
            <td key='core'>
                <NumberInput
                    value={element['core']}
                    onChange={(value) => updateElement(index, 'core', value)}
                    defaultValue='core'
                    size="xs"
                    min={coreMin}
                    max={coreMax}
                />
                <Slider
                    value={element['core']}
                    onChange={(value) => updateElement(index, 'core', value)}
                    defaultValue='core'
                    min={coreMin}
                    max={coreMax}
                    step={coreStep} />
            </td>
            <td key='speed'>
                <NumberInput
                    value={element['speed']}
                    onChange={(value) => updateElement(index, 'speed', value)}
                    defaultValue='speed'
                    size="xs"
                    suffix="Gflop/sec"
                    min={speedMin}
                    max={speedMax}
                />
                <Slider
                    value={element['speed']}
                    onChange={(value) => updateElement(index, 'speed', value)}
                    defaultValue='speed'
                    min={speedMin}
                    max={speedMax}
                    step={speedStep}
                    label={(value) => `${value} Gflop/sec`} />
            </td>
        </tr>
    ));

    return (
        <Group pt={15}>
            <Group justify="flex-start" style={{width: "25%"}}>
                <Tooltip label="Rename">
                    <Input defaultValue="New Experiment" value={title} onChange={(event) => updateTitle(event.currentTarget.value)} style={{width: "100%"}}/>
                </Tooltip>
            </Group>
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
                            <Table.Th>Core Speed</Table.Th>
                        </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>{rows}</Table.Tbody>
                </Table>
                <Button variant="default" onClick={addRow}>Add Cluster</Button>
            </Group>
            <Group pt={15} align="flex-start" width="auto">
                <Table align="flex-start" width="auto">
                    <Table.Tbody>
                        <tr>
                            <td width="auto" valign="top">
                                <Text px={10}>Read Bandwidth of the Disk on the Controller Host:  </Text>
                            </td>
                            <td width="auto">
                                <NumberInput
                                    defaultValue={readBandwidth}
                                    min={readBandwidthMin}
                                    max={readBandwidthMax}
                                    size="xs"
                                    suffix="MBps"
                                    value={readBandwidth}
                                    onChange={updateReadBandwidth} />
                                <Slider
                                    defaultValue={readBandwidth}
                                    min={readBandwidthMin}
                                    max={readBandwidthMax}
                                    step={readBandwidthStep}
                                    label={(value) => `${value} MBps`}
                                    value={readBandwidth}
                                    onChange={updateReadBandwidth}/>
                            </td>
                        </tr>
                        <tr></tr>
                        <tr>
                            <td width="auto" valign="top">
                                <Text px={10}>Write Bandwidth of the Disk on the Controller Host:  </Text>
                            </td>
                            <td width="auto">
                                <NumberInput
                                    defaultValue={writeBandwidth}
                                    min={writeBandwidthMin}
                                    max={writeBandwidthMax}
                                    size="xs"
                                    suffix="MBps"
                                    value={writeBandwidth}
                                    onChange={updateWriteBandwidth} />
                                <Slider
                                    defaultValue={writeBandwidth}
                                    min={writeBandwidthMin}
                                    max={writeBandwidthMax}
                                    step={writeBandwidthStep}
                                    label={(value) => `${value} MBps`}
                                    value={writeBandwidth}
                                    onChange={updateWriteBandwidth}/>
                            </td>
                            <td></td>
                        </tr>
                    </Table.Tbody>
                </Table>
            </Group>
            <Group justify="center" pt={15} style={{width: '100%'}}>
                <Button variant="success" onClick={handleRunSimulation}>Run Simulation</Button>
            </Group>
            <Group justify="center" align="center" style={{ width: '100%', marginTop: '20px' }}>
                {loading ? (
                    <Loader color="gray" /> // Show loader while loading
                ) : (
                    showGraph && graphData && <SimulationGraph runtimeData={graphData} id={id} />
                )}
            </Group>
            <Group justify="center" align="center" style={{ width: '100%', marginTop: '20px' }}>
                <div>
                    <Chart options={options} series={series} type="bar" height="350" />
                </div>
            </Group>
        </Group>
    );
}