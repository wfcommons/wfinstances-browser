import { Button, Center, Group, Loader, Modal, Box } from '@mantine/core';
import Cytoscape, { ElementDefinition, NodeDataDefinition } from 'cytoscape';
import {useEffect, useRef, useState} from 'react';
import { useQuery } from '@tanstack/react-query';
import { NodeModal } from '~/components/NodeModal';
import { Task, File, WfInstance } from '~/types/WfInstance';
import DAGRE from 'cytoscape-dagre';
import CytoscapeComponent from 'react-cytoscapejs';
import { useDisclosure } from '@mantine/hooks';
import {max, min} from "@floating-ui/utils";

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
    const [cy, setCy] = useState<Cytoscape.Core | null>(null);

    function swapElements() {
        setUseElementsWithFiles(prev => !prev);
    }

    const cytoscapeStylesheet = [
        {
            selector: "node",
            style: {
                "background-color": "data(bg)",
                width: "label",
                // height: "label",
                height: "60px",
                padding: "8px",
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
                width: 5.0
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
        animate: true,
        rankDir: 'TB', // Top to Bottom layout
        rankSep: 500,  // Increase vertical spacing
        fit: true,     // Fit the graph in the viewport
        padding: 50    // Add padding around the graph
    };

    // Function to resize and center the graph to fill the viewport vertically
    const fitGraphToViewport = (mode: string) => {

        if (cy) {
            // const pan = cy.pan();
            // console.log("Pan.x = " + pan.x)
            // console.log("Pan.y = " + pan.y)
            // const zoom = cy.zoom();
            // console.log("Zoom = " + zoom)
            // const bb = cy.elements().boundingBox();
            // console.log("Left-most x:", bb.x1);
            // console.log("Right-most x:", bb.x2);
            // console.log("Top-most y:", bb.y1);
            // console.log("Bottom-most y:", bb.y2);



            // Get viewport and graph dimensions
            const container = cy.container();
            const viewportHeight = container ? container.clientHeight : 0;
            const viewportWidth = container ? container.clientWidth : 0;

            const boundingBox = cy.elements().boundingBox();
            const graphHeight = boundingBox.h;
            const graphWidth = boundingBox.w;

            // console.log("Viewport height:", viewportHeight);
            // console.log("Graph height:", graphHeight);
            // console.log("Viewport width:", viewportWidth);
            // console.log("Graph width:", graphWidth);

            if (graphHeight > 0 && viewportHeight > 0 && graphWidth > 0 && viewportHeight > 0) {

                if (mode == "b") {
                    if (graphHeight > graphWidth) {
                        mode = "h"
                    } else {
                        mode = "w"
                    }
                }
                if (mode == "h") {
                    const zoomFactorH = (viewportHeight * 0.7) / graphHeight;
                    cy.zoom(zoomFactorH);
                    cy.center();
                    cy.panBy({ x: 0, y: - viewportHeight * 0.10});
                } else if (mode == "w") {
                    const zoomFactorW = (viewportWidth) / graphWidth;
                    cy.zoom(zoomFactorW);
                    cy.center();
                    cy.panBy({ x: 0, y: - viewportHeight * 0.10});
                }
                // // Calculate zoom to stretch vertically (use 90% of available height)
                // let zoomFactor;
                // if (mode == "h") {
                //     zoomFactor = max(zoomFactorW, zoomFactorH)
                // } else if (mode == "w") {
                //     zoomFactor = min(zoomFactorW, zoomFactorH)
                // }
                // console.log("Calculated zoom factor:", zoomFactor);
                //
                // // Apply zoom and center
                // // cy.fit();
                //
                // console.log("Final zoom level:", cy.zoom());
            }
        }
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
                <Button variant="light" onClick={() => cy && fitGraphToViewport("w")} disabled={!cy}>Fit to Viewport Width</Button>
                <Button variant="light" onClick={() => cy && fitGraphToViewport("h")} disabled={!cy}>Fit to Viewport Height</Button>
            </Group>
            {isLoading ? (
                <Center>
                    <Loader my={300} />
                </Center>
            ) : (
                <>
                    <NodeModal node={node} opened={openedNodeModal} onClose={closeNodeModal} />
                    <Box
                        sx={{
                            width: '100%',
                            height: '80vh',
                            overflow: 'auto',
                            border: '1px solid #eaeaea',
                            borderRadius: '4px',
                            marginTop: '16px'
                        }}
                    >
                        <div style={{ width: '100%', height: '100%' }}>
                            <CytoscapeComponent
                                key={useElementsWithFiles ? elementsWithFiles.length : elementsNoFiles.length}
                                elements={useElementsWithFiles ? elementsWithFiles : elementsNoFiles}
                                layout={layout}
                                style={{ width: '100%', height: '100vh' }}
                                stylesheet={cytoscapeStylesheet}
                                cy={(cyInstance) => {
                                    // Save the Cytoscape instance to state
                                    setCy(cyInstance);

                                    cyInstance.on("tap", evt => {
                                        setNode(evt.target.data());
                                        if (node.type !== "edge") {
                                            openNodeModal();
                                        }
                                    });

                                    cyInstance.on('layoutstop', () => {
                                        // Adjust zoom level and center after layout completes
                                        // cyInstance.center();
                                        // cyInstance.fit();
                                        // cyInstance.zoom(0.2);
                                        fitGraphToViewport("b")
                                    });
                                }}
                            />
                        </div>
                    </Box>
                </>
            )}
        </Modal>
    );
}
