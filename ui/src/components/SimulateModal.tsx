import { Modal } from '@mantine/core';

export function SimulateModal({ 
    opened,
    onClose
}: { 
    opened: boolean,
    onClose: () => void
}) {
    return (
        <Modal title="WfInstance Simulation" opened={opened} onClose={onClose} size='100%'>
        </Modal>
    );
}
