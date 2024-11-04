import {Button, Group, Modal, Table, Title, NumberInput, ActionIcon, Slider, Text, Tooltip, Tabs, UnstyledButton, rem, Stack} from '@mantine/core';
import {IconPlus, IconTrash, IconX} from '@tabler/icons-react';
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
    const initialElements = [
        { cluster: 1, bw: 400, latency: 10, computeNode: 16, core: 1, speed: 1},
        { cluster: 2, bw: 100, latency: 10, computeNode: 64, core: 1, speed: 2},
        { cluster: 3, bw: 300, latency: 10, computeNode: 32, core: 1, speed: 3},
    ];
    const initialReadBandwidth = 100;
    const initialWriteBandwidth = 100;
  
    const [tabs, setTabs] = useState([
        { id: '1',
            data: JSON.parse(JSON.stringify(initialElements)),
            read: JSON.parse(JSON.stringify(initialReadBandwidth)),
            write: JSON.parse(JSON.stringify(initialWriteBandwidth))
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
            write: JSON.parse(JSON.stringify(initialWriteBandwidth))};
        setTabs([...tabs, newTab]);
        setActiveTab(newId); // Set focus on the new tab
    };

    //Remove a tab
    const removeTab = (id) => {
        setTabs(tabs.filter((tab) => tab.id !== id));
        setActiveTab(tabs.length > 1 ? tabs[0].id : '');
    };

    const updateTabData = (id, newData) => {
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
                         New Experiment
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
                            onElementChange={(newData) => updateTabData(tab.id, newData)}
                            onReadBandwidthChange={(newData) => updateReadBandwidthTabData(tab.id, newData)}
                            onWriteBandwidthChange={(newData) => updateWriteBandwidthTabData(tab.id, newData)}
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
    onElementChange, 
    onReadBandwidthChange, 
    onWriteBandwidthChange,
    id
}) {

    const [elements, setElements] = useState(tabData)

    const [readBandwidth, setReadBandwidth] = useState(tabReadBandwidth);
    const [writeBandwidth, setWriteBandwidth] = useState(tabWriteBandwidth);
  
    const [newCluster, increaseCluster] = useState(elements.length+1)

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
    const handleRunSimulation = () => {
        const data = getData(); // Call getData to get the current state
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
                    max={256}
                />
                <Slider
                    value={element['computeNode']}
                    onChange={(value) => updateElement(index, 'computeNode', value)}
                    defaultValue='computeNode'
                    min={1}
                    max={256}
                    step={1} />
            </td>
            <td key='core'>
                <NumberInput
                    value={element['core']}
                    onChange={(value) => updateElement(index, 'core', value)}
                    defaultValue='core'
                    size="xs"
                    min={1}
                    max={10}
                />
                <Slider
                    value={element['core']}
                    onChange={(value) => updateElement(index, 'core', value)}
                    defaultValue='core'
                    min={1}
                    max={10}
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
        <Group pt={15}>
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
            <Stack align="stretch">
                <Group pt={15} justify="flex-start">
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
                                        onChange={updateReadBandwidth} />
                                    <Slider
                                        value={readBandwidth}
                                        onChange={updateReadBandwidth}
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
                                        onChange={updateWriteBandwidth} />
                                    <Slider
                                        value={writeBandwidth}
                                        onChange={updateWriteBandwidth}
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
                </Group>
                <Group justify="center" pt={15}>
                    <Button variant="success" onClick={handleRunSimulation}>Run Simulation</Button>
                </Group>
            </Stack>
        </Group>


    );
}