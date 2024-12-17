import {Button, Group, Modal, Table, Title, NumberInput, ActionIcon, Slider, List, ListItem,
    Text, Tooltip, Tabs, UnstyledButton, rem, Input, Loader, Accordion, Menu, Divider} from '@mantine/core';
import {IconPlus, IconTrash, IconX, IconHelp, IconChevronDown} from '@tabler/icons-react';
import {simulate} from '../../workflow_simulator/simulator';
import { SimulationGraph } from '~/components/SimulationGraph';
import React, { useState, useEffect } from 'react';
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
        // { cluster: 3, bw: 300, latency: 10, computeNode: 32, core: 1, speed: 3},
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
    const modal_title = "Simulation of workflow instance: " + id

    return (
        <Modal title={<Title order={4}>{modal_title}</Title>}  opened={opened} onClose={onClose} size='100%'>

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
                            <Text mx={0} size="sm" style={{
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

    const bwMin = 100, bwMax = 10000, bwStep = 50;
    const latencyMin = 1, latencyMax = 200, latencyStep = 1;
    const computeNodeMin = 1, computeNodeMax = 256, computeNodeStep = 1;
    const coreMin = 1, coreMax = 48, coreStep = 1;
    const speedMin = 1, speedMax = 100, speedStep = 1;
    const readBandwidthMin = 100, readBandwidthMax = 10000, readBandwidthStep = 50;
    const writeBandwidthMin = 100, writeBandwidthMax = 10000, writeBandwidthStep = 50;

    const [deleteClusterButtonDisabled, setDeleteClusterButtonDisabled] = useState(false);
    const [addClusterButtonDisabled, setAddClusterButtonDisabled] = useState(false);

    const [selectedTaskSelectionAlgorithm, setSelectedTaskSelectionAlgorithm] = useState('MostFlops');
    const [selectedClusterSelectionAlgorithm, setSelectedClusterSelectionAlgorithm] = useState('FastestCores');


    interface TaskData {
        task_name: string;
        cluster_index: number;
        scheduled_time: number;
        completion_time: number;
    }

    const [showGraph, setShowGraph] = useState(false); // New state to control graph visibility
    const [graphData, setGraphData] = useState<TaskData[] | null>(null);
    const [seriesData, setSeriesData] =useState<{ data: { x: string; y: [number, number], completion: number, name: string }[] }[] | null>(null);
    const [loading, setLoading] = useState(false);
    const [colorMap, setColorMap] = useState<{ [key: string]: string }>(null);

    const [elements, setElements] = useState(tabData)

    const [readBandwidth, setReadBandwidth] = useState(tabReadBandwidth);
    const [writeBandwidth, setWriteBandwidth] = useState(tabWriteBandwidth);

    const [title, setTitle] = useState(tabTitle);

    const [newCluster, increaseCluster] = useState(elements.length+1);

    useEffect(() => {
        if (graphData) {
            const newColorMap = getColorMap(graphData);
            setColorMap(newColorMap);
        }
    }, [graphData]);

    const generateRandomColor = (): string => {
        const letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    };

    const getColorMap = (tasks: TaskData[]): { [key: string]: string } => {
        const colorMap: { [key: string]: string } = {};
        const usedColors: Set<string> = new Set();

        tasks.forEach(task => {
            const lastUnderscoreIndex = task.task_name.lastIndexOf('_');
            const baseName = lastUnderscoreIndex >= 0
                ? task.task_name.substring(0, lastUnderscoreIndex)
                : task.task_name;

            if (!colorMap[baseName]) {
                let newColor = generateRandomColor();
                while (usedColors.has(newColor)) {
                    newColor = generateRandomColor();
                }
                colorMap[baseName] = newColor;
                usedColors.add(newColor);
            }
        });

        return colorMap;
    };

    const options = {
        chart: {
            type: "rangeBar",
        },
        colors: [function ({ seriesIndex, dataPointIndex, w }: any) {
            const taskName = w.config.series[seriesIndex].data[dataPointIndex].name;
            const lastUnderscoreIndex = taskName.lastIndexOf('_');
            const baseName = lastUnderscoreIndex >= 0
                ? taskName.substring(0, lastUnderscoreIndex)
                : taskName; // Fallback if no underscore

            const color = colorMap?.[baseName] || '#000000'; // Map to baseName
            // console.log(`Task: ${taskName}, BaseName: ${baseName}, Color: ${color}`);
            return color;
        }],
        plotOptions: {
            bar: {
                horizontal: true,
                barHeight: "50%",
                dataLabels: { enabled: false },
                borderRadius: 4,
            },
        },
        title: {
            text: "Execution Gantt chart", // Use the title prop here
            align: 'center',
        },
        xaxis: {
            type: "numeric",
            title: { text: "Time (s)" },
            labels: {
                show: true, // Show labels on the x-axis
                formatter: function (value) {
                    return value.toFixed(2); // Display time with 2 decimal places
                }
            },
        },
        tooltip: {
            custom: function({ seriesIndex, dataPointIndex, w }) {
                const pointData = w.config.series[seriesIndex].data[dataPointIndex];
                const taskName = pointData.name;
                const completionTime = pointData.y[1];
                return `
                    <div style="padding: 5px; border: 1px solid #ccc; background: #fff;">
                        <strong>Task Name:</strong> ${taskName}<br />
                        <strong>Completion Time:</strong> ${completionTime}
                    </div>
                `;
            }
        }
    };

    function assignTasksToNodes(runtimeData: TaskData[], clusters: ClusterData['clusters']): ScheduledTask[] {
        const scheduledTasks: ScheduledTask[] = [];

        runtimeData.forEach(task => {
            const { cluster_index, scheduled_time, completion_time } = task;
            const computeNodes = clusters[cluster_index].computeNodes;

            let assignedNode = -1;
            for (let node = 0; node < computeNodes; node++) {
                const isOverlap = scheduledTasks.some(t =>
                    t.cluster_index === cluster_index &&
                    t.compute_node === node &&
                    (t.scheduled_time < completion_time && t.completion_time > scheduled_time)
                );
                if (!isOverlap) {
                    assignedNode = node;
                    break;
                }
            }

            if (assignedNode !== -1) {
                scheduledTasks.push({ ...task, compute_node: assignedNode });
            }
        });

        return scheduledTasks;
    }

    interface ScheduledTask extends TaskData {
        compute_node: number;
    }

    function transformToSeries(scheduledTasks: ScheduledTask[]): { data: { x: string; y: [number, number], completion: number, name: string }[] }[] {
        const data = scheduledTasks.map(task => ({
            x: `Cluster ${task.cluster_index}: Node ${task.compute_node}`,
            y: [task.scheduled_time, task.completion_time] as [number, number],
            completion: task.completion_time,
            name: task.task_name, // Include the task name for tooltip
        }));

        return [{ data }];
    }


    const addRow = () => {
        increaseCluster(newCluster + 1);// Increment cluster number
        const newElement = { cluster: newCluster, bw: 100, latency: 10, computeNode: 32, core: 1, speed: 1 };
        const updatedElements = [...elements, newElement];
        setElements(updatedElements); // Add new element to state
        onElementChange(updatedElements); //update parent function
        setDeleteClusterButtonDisabled(false)
        setAddClusterButtonDisabled(newCluster < 8);


    };
    const deleteRow = (index) => {
        const updatedElements = elements.filter((_, i) => i !== index); // Remove the row at the given index
        setElements(updatedElements);
        onElementChange(updatedElements);
        console.log(updatedElements.length)
        setDeleteClusterButtonDisabled(updatedElements.length == 1)
        setAddClusterButtonDisabled(false);

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
        const platformSpec = {
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
                "speed": element.speed,
            };
            platformSpec.clusters[(index).toString()] = values;
        });

        const simulationInput = {
            platformSpec: platformSpec,
            taskSelectionScheme: selectedTaskSelectionAlgorithm,
            clusterSelectionScheme: selectedClusterSelectionAlgorithm,
        }

        // console.log(simulationInput);
        return simulationInput;
    };

    // Combined function to run simulation and get data
    const handleRunSimulation = async () => {
        const data = getData();
        setLoading(true); // Show loader
        // setClusterData(data);
        // Pass the simulation data to the simulate function and wait for results
        const results = await simulate(id, data);
        setGraphData(results.result.Runtime);  // Set the data returned from simulation
        const scheduledTasks = assignTasksToNodes(results.result.Runtime, data.platformSpec.clusters);
        const series = transformToSeries(scheduledTasks);
        setColorMap(getColorMap(results.result.Runtime))
        console.log(series);
        setSeriesData(series);
        setShowGraph(true);  // Display the graph after simulation
        setLoading(false);
    };

    // Generate table rows with input fields
    const rows = elements.map((element, index) => (
        <tr key={element.cluster}>
            <td style={{ width: 'auto', padding: '2px', textAlign: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ActionIcon color="red" disabled={deleteClusterButtonDisabled} onClick={() => deleteRow(index)}>
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
                    suffix="MBps"
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
                    label={(value) => `${value} MBps`} />
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
                <Accordion style={{width: "100%"}}>
                    <Accordion.Item value="item-1">
                        <Accordion.Control icon={<IconHelp />}><Title order={4}>Compute Platform Specification</Title></Accordion.Control>
                        <Accordion.Panel style={{ width: '100%' }}>

                            <p>
                                The simulated platform consists of a user host, on which all the workflow's
                                input / output files are and will be stored, and of at least one compute
                                cluster. You can add/remove and specify clusters as you wish with the widget below.
                                Each cluster is described by:

                                <List style={{ paddingLeft: '30px' }}>
                                    <ListItem>
                                        A bandwidth and latency for the link that connects the cluster to the user host
                                    </ListItem>
                                    <ListItem>
                                        A number of compute nodes, a number of core per compute node, and a core speed
                                    </ListItem>
                                </List>
                            </p>


                            <p>
                                The user host is described by:
                                <List style={{ paddingLeft: '30px' }}>
                                    <ListItem>
                                        The read and write bandwidth of the disk that is used to store all workflow files
                                    </ListItem>
                                </List>
                            </p>

                            <p>
                                We assume that the measured task execution times in workflow instances are based on an execution on a 100 GFlop/sec core.
                                So if a task in the workflow instance has an execution time of 10 seconds, and you define a core
                                to compute at 200 GFlop/sec, then that task's execution would be simulated to last 5 seconds on that core.
                            </p>

                        </Accordion.Panel>
                    </Accordion.Item>
                </Accordion>
                <Table striped highlightOnHover withTableBorder withColumnBorders>
                    <Table.Thead>
                        <Table.Tr>
                            <Table.Th>Cluster</Table.Th>
                            <Table.Th>Link bandwidth</Table.Th>
                            <Table.Th>Link latency</Table.Th>
                            <Table.Th>#Compute nodes</Table.Th>
                            <Table.Th>#Cores per node</Table.Th>
                            <Table.Th>Core speed</Table.Th>
                        </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>{rows}</Table.Tbody>
                </Table>
                <Button variant="default" disabled={addClusterButtonDisabled} onClick={addRow}>Add Cluster</Button>
            </Group>
            <Group pt={15} align="flex-start" style={{width: '100%'}}>
                <Table align="flex-start" width="auto">
                    <Table.Tbody>
                        <tr>
                            <td width="auto" valign="top">
                                <Text px={10}>Read bandwidth of the user host's disk:  </Text>
                            </td>
                            <td width="40px"></td>
                            <td width="auto" valign="top">
                                <Text px={10}>Write bandwidth of the user host's disk:  </Text>
                            </td>
                        </tr>
                        <tr>
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
                            <td width="40px"></td>
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
                        </tr>
                    </Table.Tbody>
                </Table>
            </Group>

            <Group pt={15} align="flex-start" style={{width: '100%'}}>
                <Accordion style={{width: "100%"}}>
                    <Accordion.Item value="item-1">
                        <Accordion.Control icon={<IconHelp />}><Title order={4}>Scheduling Algorithm</Title></Accordion.Control>
                        <Accordion.Panel style={{ width: '100%' }}>

                            <p>
                                Workflow scheduling is done using a standard "list scheduling" approach: Whenever
                                at least one task is ready and one core is idle, select one of the ready tasks and select one of the clusters
                                with least one idle core an schedule that task on that cluster.  You can opt for different
                                task and cluster scheduling schemes below using the two pulldown menus.
                            </p>
                        </Accordion.Panel>
                    </Accordion.Item>
                </Accordion>
                <Table align="flex-start" width="auto">
                    <Table.Tbody>
                        <tr>
                            <td width="auto">
                                <Text px={10}>Task selection scheme:</Text>
                            </td>
                            <td width="auto">
                                <Menu>
                                    <Menu.Target>
                                        <Button variant="default">
                                            {selectedTaskSelectionAlgorithm}<IconChevronDown style={{ marginLeft: '8px' }}/>
                                        </Button>
                                    </Menu.Target>

                                    <Menu.Dropdown style={{zIndex: 1000}}>
                                        <Menu.Item onClick={() => setSelectedTaskSelectionAlgorithm('MostFlops')}>Most
                                            flops</Menu.Item>
                                        <Menu.Item onClick={() => setSelectedTaskSelectionAlgorithm('MostData')}>Most
                                            data</Menu.Item>
                                        <Menu.Item onClick={() => setSelectedTaskSelectionAlgorithm('MostChildren')}>Most
                                            children</Menu.Item>
                                    </Menu.Dropdown>
                                </Menu>
                            </td>
                            <td width="15%"></td>
                            <td width="auto">
                                <Text px={10}>Cluster selection scheme:</Text>
                            </td>
                            <td width="auto">
                                <Menu>
                                    <Menu.Target>
                                        <Button variant="default">
                                            {selectedClusterSelectionAlgorithm} <IconChevronDown style={{ marginLeft: '8px' }}/>
                                        </Button>
                                    </Menu.Target>

                                    <Menu.Dropdown style={{zIndex: 1000}}>
                                        <Menu.Item onClick={() => setSelectedClusterSelectionAlgorithm('FastestCores')}>FastestCores</Menu.Item>
                                        <Menu.Item onClick={() => setSelectedClusterSelectionAlgorithm('FastestNetwork')}>FastestNetwork</Menu.Item>
                                        <Menu.Item onClick={() => setSelectedClusterSelectionAlgorithm('MostIdleCores')}>MostIdleCores</Menu.Item>
                                    </Menu.Dropdown>
                                </Menu>
                            </td>
                        </tr>
                    </Table.Tbody>
                </Table>
            </Group>

            <Group pt={15} align="flex-start" style={{width: '100%'}}>
                <Accordion style={{width: "100%"}}>
                    <Accordion.Item value="item-1">
                    </Accordion.Item>
                </Accordion>
            </Group>

            <Group justify="center" pt={15} style={{width: '100%'}}>
                <Button variant="success" onClick={handleRunSimulation}>Run
                    Simulation</Button>
            </Group>
            <Group justify="center" align="center" style={{width: '100%', marginTop: '20px'}}>
                {loading ? (
                    <Loader color="gray"/> // Show loader while loading
                ) : (
                    showGraph && graphData && <SimulationGraph runtimeData={graphData} id={id}/>
                )}
            </Group>
            <Group justify="center" align="center" style={{width: '100%', marginTop: '20px'}}>
                <div>
                    {loading ? (
                        <Loader color="gray"/> // Show loader while loading
                    ) : (
                        showGraph &&
                        <Chart options={options} series={seriesData} type="rangeBar" height="750" width="800"/>
                    )}
                </div>
            </Group>
        </Group>
    );
}