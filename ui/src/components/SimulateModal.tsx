import {Button, Group, Modal, rem, Tabs, Tooltip, UnstyledButton} from '@mantine/core';
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

    return (
        <Modal title="WfInstance Simulation" opened={opened} onClose={onClose} size='100%'>
            <i>{id}</i>
            <Group justify="center" pt={15}>
                <Button variant="default" onClick={() => simulate(id)}>Run Simulation</Button>
            </Group>
            <Group justify="center">
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
                    </Tabs.List>

                    {tabs.map((tab) => (
                        <Tabs.Panel key={tab.id} value={tab.id}>
                            {tab.content}
                        </Tabs.Panel>
                    ))}
                </Tabs>
                <Tooltip label={"Add Cluster"}>
                    <UnstyledButton onClick={addTab}><IconPlus style={iconStyle} /></UnstyledButton>
                </Tooltip>
            </Group>
        </Modal>
    );
}
