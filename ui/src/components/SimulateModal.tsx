import {Button, Group, Modal} from '@mantine/core';
//import {simulate} from '../../workflow_simulator/simulator';

function placeholder() {
    console.log("hello world");
}
export function SimulateModal({ 
    opened,
    onClose
}: { 
    opened: boolean,
    onClose: () => void
}) {
    return (
        <Modal title="WfInstance Simulation" opened={opened} onClose={onClose} size='100%'>
            <Group justify="center" pt={15}>
                <Button variant="default" onClick={placeholder()}>Run Simulation</Button>
            </Group>
        </Modal>
    );
}
