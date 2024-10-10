import {Button, Group, Modal} from '@mantine/core';
import {simulate} from '../../workflow_simulator/simulator';
export function SimulateModal({
    id,
    opened,
    onClose
}: { 
    id: string,
    opened: boolean,
    onClose: () => void
}) {
    return (
        <Modal title="WfInstance Simulation" opened={opened} onClose={onClose} size='100%'>
            <i>{id}</i>
            <Group justify="center" pt={15}>
                <Button variant="default" onClick={() => simulate(id)}>Run Simulation</Button>
            </Group>
        </Modal>
    );
}
