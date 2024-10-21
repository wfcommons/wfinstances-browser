import {Button, Group, Modal, rem, Slider, Tabs, Tooltip, UnstyledButton, Text, Fieldset} from '@mantine/core';
import { IconX, IconPlus } from '@tabler/icons-react';
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
    const iconStyle = { width: rem(12), height: rem(12) };
    const [tabs, setTabs] = useState([
        { id: '1', label: 'Cluster 1', content: 'Content of Cluster 1' },
        { id: '2', label: 'Cluster 2', content: 'Content of Cluster 2' },
        { id: '3', label: 'Cluster 3', content: 'Content of Cluster 3' },
    ]);
    const [tabTracker, increaseTracker] = useState(tabs.length+1);

    // Track the currently active tab
    const [activeTab, setActiveTab] = useState('1');

    //Add a new tab
    const addTab = () => {
        increaseTracker(tabTracker + 1);
        const newId = (tabTracker).toString();
        const newTab = { id: newId, label: `Cluster ${newId}`, content: `Content of Cluster ${newId}` };
        setTabs([...tabs, newTab]);
        setActiveTab(newId); // Set focus on the new tab
    };

    //Remove a tab
    const removeTab = (id) => {
        setTabs(tabs.filter((tab) => tab.id !== id));
        setActiveTab(tabs.length > 1 ? tabs[0].id : '');
    };

    //steps for "Cores per compute node" slider
    const marks = [
        { value: 0, label: '16' },
        { value: 25, label: '32' },
        { value: 50, label: '64' },
        { value: 75, label: '128' },
        { value: 100, label: '256' },
    ];
    return (
        <Modal title="WfInstance Simulation" opened={opened} onClose={onClose} size='100%'>
            <i>{id}</i>
            <Group justify="center" pt={15}>
                <Button variant="default" onClick={() => simulate(id)}>Run Simulation</Button>
            </Group>
            <Group justify="center" pt={15}>
                <Fieldset legend="Disk Specifications">
                    <Text size="sm" mt="xl">Read Bandwidth</Text>
                    <Slider defaultValue={100} min={50} max={1000} step={50} label={(value) => `${value} MBps`} />
                    <Text size="sm" mt="xl">Write Bandwidth</Text>
                    <Slider defaultValue={100} min={50} max={1000} step={50} label={(value) => `${value} MBps`} />
                </Fieldset>
            </Group>
            <Group justify="center" pt={10}>
                <Tabs defaultValue="cluster">
                    <Tabs.List>
                        {tabs.map((tab) => (
                            <Tabs.Tab key={tab.id} value={tab.id} rightSection={<UnstyledButton
                                onClick={(e) => {
                                    e.stopPropagation();
                                    removeTab(tab.id);
                                }}>
                                <IconX style={iconStyle} />
                            </UnstyledButton>}>
                                {tab.label}
                            </Tabs.Tab>
                        ))}
                        <Tooltip label={"Add Cluster"}>
                            <UnstyledButton onClick={addTab}><IconPlus style={iconStyle} /></UnstyledButton>
                        </Tooltip>
                    </Tabs.List>

                    {tabs.map((tab) => (
                        <Tabs.Panel key={tab.id} value={tab.id}>
                            {tab.content}
                            <Fieldset legend="Cluster Link Specifications">
                                <Text size="sm" mt="xl">Bandwidth</Text>
                                <Slider defaultValue={100} min={50} max={1000} step={50} label={(value) => `${value} kBps`} />
                                <Text size="sm" mt="xl">Latency</Text>
                                <Slider defaultValue={10} min={1} max={100} step={1} label={(value) => `${value} ms`} />
                            </Fieldset>
                            <Fieldset legend="Compute Node Specifications">
                                <Text size="sm" mt="xl">Number of Compute Nodes</Text>
                                <Slider defaultValue={1} min={1} max={10} step={1} />
                                <Text size="sm" mt="xl">Cores per Compute Node</Text>
                                <Slider
                                    defaultValue={50}
                                    label={(val) => marks.find((mark) => mark.value === val)!.label}
                                    step={25}
                                    marks={marks}
                                    styles={{ markLabel: { display: 'none' } }}
                                />
                                <Text size="sm" mt="xl">Speed of Each Core</Text>
                                <Slider defaultValue={1} min={1} max={10} step={1} label={(value) => `${value} Gflop/sec`} />
                            </Fieldset>
                        </Tabs.Panel>
                    ))}
                </Tabs>
            </Group>
        </Modal>
    );
}
