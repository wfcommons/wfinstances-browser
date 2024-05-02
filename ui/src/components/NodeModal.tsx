import { Container, Modal } from "@mantine/core";
import { NodeDataDefinition } from "cytoscape";

export function NodeModal({ 
    node, 
    opened, 
    onClose 
}: {
  node: NodeDataDefinition,
  opened: boolean,
  onClose: () => void
}) {
    return (
        <>
            {(node.type === "task" || node.type === "file") && (
                <Modal title="Node Details" opened={opened} onClose={onClose} size='50%'>
                    <Container>
                        {Object.keys(node.obj).map((element) => (
                            <div key={node.id}>
                                {element}: {Array.isArray(node.obj[element]) ? node.obj[element].join(', ') : node.obj[element]}
                            </div>
                        ))}
                    </Container>
                </Modal>
            )}
        </>
    );
}