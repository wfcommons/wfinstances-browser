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
                <Modal title="" opened={opened} onClose={onClose} size='50%'>
                    <Container>
                        {Object.keys(node.obj).map((element) => (
                            <div key={node.id}>
                                <strong>{element}</strong>: {Array.isArray(node.obj[element])
                                ? (node.obj[element].length > 0 ? node.obj[element].join(', ') : "n/a")
                                : node.obj[element]}
                            </div>
                        ))}
                    </Container>
                </Modal>
            )}
        </>
    );
}