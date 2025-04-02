import { Button, Center, Group, Loader, Modal } from '@mantine/core';
import Cytoscape, { ElementDefinition, NodeDataDefinition } from 'cytoscape';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { NodeModal } from '~/components/NodeModal';
import { Task, File, WfInstance } from '~/types/WfInstance';
import DAGRE from 'cytoscape-dagre';
import CytoscapeComponent from 'react-cytoscapejs';
import { useDisclosure } from '@mantine/hooks';

Cytoscape.use(DAGRE);

export function VizModal({
    id,
    client_ip,
    opened,
    onClose
}: { 
    id: string,
    client_ip: string,
    opened: boolean,
    onClose: () => void
}) {
    const [openedNodeModal, { open: openNodeModal, close: closeNodeModal }] = useDisclosure(false);
    const [node, setNode] = useState<NodeDataDefinition>({});
    const [elementsWithFiles, setElementsWithFiles] = useState<ElementDefinition[]>([]);
    const [elementsNoFiles, setElementsNoFiles] = useState<ElementDefinition[]>([]);
    const [useElementsWithFiles, setUseElementsWithFiles] = useState(false);

    function swapElements() {
        setUseElementsWithFiles(prev => !prev);
    }

    const cytoscapeStylesheet = [
        {
            selector: "node",
            style: {
                "background-color": "data(bg)",
                width: "label",
                height: "label",
                padding: "6px",
                shape: "round-rectangle"
            }
        },
        {
            selector: "node[label]",
            style: {
                label: "data(label)",
                "font-size": "12",
                color: "white",
                "text-halign": "center",
                "text-valign": "center"
            }
        },
        {
            selector: "edge",
            style: {
                "curve-style": "bezier",
                "target-arrow-shape": "triangle",
                width: 1.5
            }
        },
        {
            selector: "edge[label]",
            style: {
                label: "data(label)",
                "font-size": "12",
                "text-background-color": "white",
                "text-background-opacity": 1,
                "text-background-padding": "2px",
                "text-border-color": "black",
                "text-border-style": "solid",
                "text-border-width": 0.5,
                "text-border-opacity": 1
            }
        }
    ] as cytoscape.Stylesheet[];

    const layout = {
        name: "dagre",
        animate: true
    };

    function getRandomColorHex(): string {
        const randomize = () => Math.floor(Math.random() * 256).toString(16).padStart(2, '0');
        const [red, green, blue] = [randomize(), randomize(), randomize()];

        return `#${red}${green}${blue}`;
    }

    function buildGraphElements(wfInstance: WfInstance): ElementDefinition[] {
        const workflowSpec = wfInstance.workflow.specification;
        const tasks = workflowSpec.tasks;
        const files = workflowSpec.files ?? [];

        // Create a map of task execution times
        let task_execution_times: { [key: string]: number } = {};
        wfInstance.workflow.execution.tasks.forEach((task_execution: Object) => {
            task_execution_times[task_execution["id"]] = task_execution["runtimeInSeconds"]
        });


        const graphElementsWithFiles: ElementDefinition[] = [];
        const graphElementsNoFiles: ElementDefinition[] = [];
        const colorMap = new Map<string, string>();

        files.forEach((file: File) => {
            graphElementsWithFiles.push({ data: { id: file.id, label: file.id, bg: '#A9A9A9', type: 'file', obj: file } });
        });

        tasks.forEach((task: Task) => {
            task.runtimeInSeconds = task_execution_times[task.id]
            let bgColor;
            if (colorMap.has(task.name)) {
                bgColor = colorMap.get(task.name);
            } else {
                bgColor = getRandomColorHex();
                colorMap.set(task.name, bgColor);
            }

            graphElementsWithFiles.push({ data: { id: task.id, label: task.name, bg: bgColor, type: 'task', obj: task } });
            graphElementsNoFiles.push({ data: { id: task.id, label: task.name, bg: bgColor, type: 'task', obj: task } });
    
            task.inputFiles?.forEach((fileId: string) => {
                graphElementsWithFiles.push({ data: { source: fileId, target: task.id, type: 'edge' } });
            });

            task.outputFiles?.forEach((fileId: string) => {
                graphElementsWithFiles.push({ data: { source: task.id, target: fileId, type: 'edge' } });
            });

            task.children?.forEach((childId: string) => {
                graphElementsNoFiles.push({ data: {source: task.id, target: childId, type: 'edge' }});
            });



        })
        setElementsWithFiles(graphElementsWithFiles);
        setElementsNoFiles(graphElementsNoFiles);
        return graphElementsWithFiles;
    }

    const { isLoading, refetch } = useQuery({
        refetchOnWindowFocus: false,
        queryKey: ['id', id],
        queryFn: () => 
            fetch(`/wf-instances/public/viz/${id}`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'text/plain',
                    },
                    body: JSON.stringify({"client_ip": client_ip}),
                })
                .then(res => res.json())
                .then(res => buildGraphElements(res.result))
    });

    return (
        <Modal title="WfInstance Visualization" opened={opened} onClose={onClose} size='100%'>
            <i>{id}</i>
            <Group justify="center" pt={15}>
                <Button variant="success" onClick={swapElements}>{useElementsWithFiles ? "Hide Files" : "Show Files"}</Button>
                <Button variant="default" onClick={() => refetch()}>Shuffle Colors</Button>
            </Group>
            {isLoading ? (
                <Center>
                    <Loader my={300} />
                </Center>
            ) : (
                <>
                    <NodeModal node={node} opened={openedNodeModal} onClose={closeNodeModal} />
                    <CytoscapeComponent
                        key={useElementsWithFiles ? elementsWithFiles.length : elementsNoFiles.length}
                        elements={useElementsWithFiles? elementsWithFiles : elementsNoFiles}
                        layout={layout}
                        style={{ width: '100%', height: '100vh' }}
                        stylesheet={cytoscapeStylesheet}
                        cy={cy => {
                            cy.on("tap", evt => {
                                setNode(evt.target.data());
                                if (node.type !== "edge") {
                                    openNodeModal();
                                }
                            });
                            cy.on('layoutstop', () => {
                                // cy.fit();  // Fit the graph to the viewport
                                cy.zoom(2);  // Adjust zoom level
                                cy.center()
                            });
                        }}
                    />
                </>
            )}
        </Modal>
    );
}
