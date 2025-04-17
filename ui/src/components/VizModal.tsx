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
    const [rankSep, setRankSep] = useState<number | 800>(800);

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
                padding: "8px",
                shape: "round-rectangle"
            }
        },
        {
            selector: "node[label]",
            style: {
                label: "data(label)",
                "font-size": "40",
                color: "white",
                "text-halign": "center",
                "text-valign": "center",
                "text-wrap": "wrap", // ← enables wrapping
                "text-max-width": "100px", // ← max width before wrapping
                "text-justification": "left"
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
        rankSep: rankSep,
        fit: true,     // Fit the graph in the viewport
        padding: 50    // Add padding around the graph
    };

    // Function to resize and center the graph to fill the viewport vertically
    const fitGraphToViewport = (mode: string) => {

        if (cy) {
            // Computing the graph's number of levels
            // (Based on the cytoscape object, rather than getting the depth from the backend,
            // which would be more efficient)
            const levels: Set<number> = new Set();
            cy.nodes().forEach((node) => {
                const nodePosition = node.position();
                const nodeLevel = nodePosition.y; // This is the level based on y-axis position
                levels.add(nodeLevel);
            });
            const numLevels = levels.size

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
                    // console.log("NumLevels = " + numLevels)
                    // console.log("viewportHeight = " + viewportHeight)
                    const zoomFactorH = 0.87*(viewportHeight) / ((numLevels ) * rankSep)
                    // console.log("zoomFactorH = " + zoomFactorH)
                    cy.zoom(zoomFactorH);
                    cy.center()
                } else if (mode == "w") {
                    const zoomFactorW = (viewportWidth) / graphWidth;
                    cy.zoom(zoomFactorW);
                    cy.center();
                }
            }
        }
    };

    function getRandomColorHex(): string {
        const randomize = () => Math.floor(Math.random() * 256).toString(16).padStart(2, '0');
        const [red, green, blue] = [randomize(), randomize(), randomize()];

        return `#${red}${green}${blue}`;
    }

    function addWrapPoints(label: string, everyN = 28): string {
        return label.replace(new RegExp(`(.{${everyN}})`, 'g'), '$1\u200b');
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

            graphElementsWithFiles.push({ data: { id: task.id, label: addWrapPoints(task.name), bg: bgColor, type: 'task', obj: task } });
            graphElementsNoFiles.push({ data: { id: task.id, label: addWrapPoints(task.name), bg: bgColor, type: 'task', obj: task } });

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
                                style={{ width: '100%', height: '70vh' }}
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
                                        fitGraphToViewport("h")  // By default, adjust to fill height
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
