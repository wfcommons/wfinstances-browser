import {Button, Center, Group, Loader, Modal, Box, Slider} from '@mantine/core';
import Cytoscape, { ElementDefinition, NodeDataDefinition } from 'cytoscape';
import {useEffect, useRef, useState} from 'react';
import { useQuery } from '@tanstack/react-query';
import { NodeModal } from '~/components/NodeModal';
import { Task, File, WfInstance } from '~/types/WfInstance';
import DAGRE from 'cytoscape-dagre';
import CytoscapeComponent from 'react-cytoscapejs';
import { useDisclosure } from '@mantine/hooks';
import Cytoscape from 'cytoscape';
import CytoscapeComponent from 'react-cytoscapejs';

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
        const last_mode = localStorage.getItem('graph_last_mode') || "";
        if (mode == "") {
            mode = last_mode;
        }
        if (mode == "") {
            mode = "w";   // by default
        }
        localStorage.setItem('graph_last_mode', mode);

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

            if (graphHeight > 0 && viewportHeight > 0 && graphWidth > 0 && viewportHeight > 0) {

                if (mode == "h") {
                    const zoomFactorH = 0.9*(viewportHeight) / ((numLevels - 1) * rankSep  + numLevels * 45)
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

    function addWrapPoints(label: string, everyN = 10000): string {
        return label.replace(new RegExp(`(.{${everyN}})`, 'g'), '$1\u200b');
    }

    function buildGraphElements(wfInstance: WfInstance): ElementDefinition[] {
        const workflowSpec = wfInstance.workflow.specification;
        const tasks = workflowSpec.tasks;
        const files = workflowSpec.files ?? [];

        // Create a map of task execution times
        const task_execution_times: { [key: string]: number } = {};
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

    // Add these export functions
    const exportSVG = () => {
        if (!cy) return;

        // Get SVG string
        const svgContent = cy.svg({scale: 0.1, full: true});

        // Create a blob and download
        const blob = new Blob([svgContent], {type: 'image/svg+xml;charset=utf-8'});
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.download = `graph-${id}.svg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    useEffect(() => {
        // This code only runs on the client after mounting
        import('cytoscape-svg').then((svgModule) => {
            const svg = svgModule.default;
            Cytoscape.use(svg);
        });
    }, []);

    return (
        <Modal title="WfInstance Visualization" opened={opened} onClose={onClose} size='100%'>
            <i>{id}</i>
            <Group justify="center" pt={15}>
                <Button variant="success" onClick={swapElements}>{useElementsWithFiles ? "Hide Files" : "Show Files"}</Button>
                <Button variant="default" onClick={() => refetch()}>Shuffle Colors</Button>
                <Button variant="light" onClick={() => cy && fitGraphToViewport("w")} disabled={!cy}>Fit to Width</Button>
                <Button variant="light" onClick={() => cy && fitGraphToViewport("h")} disabled={!cy}>Fit to Height</Button>
                <Button variant="outline" onClick={exportSVG} disabled={!cy}>Export (SVG)</Button>
                <Box style={{minWidth: '250px'}}>
                    <div style={{fontSize: 'small', marginBottom: '0px', textAlign: 'center'}}>Inter-level spacing</div>
                    <Slider
                        min={1}
                        max={20}
                        step={1}
                        marks={[
                            // {value: 1, label: '-'},
                            // {value: 20, label: '+'}
                            {value: 1, label: ''},
                            {value: 20, label: ''}
                        ]}
                        style={{minWidth: '200px'}}
                        defaultValue={10}
                        styles={(theme) => ({
                            // Hide the colored track to the left of the thumb
                            track: {
                                '&:before': {
                                    display: 'none', // This removes the colored part
                                }
                            },
                            // You can also customize other parts if needed
                            thumb: {
                                borderWidth: 2,
                                height: 16,
                                width: 16,
                                backgroundColor: theme.white,
                            },
                            // Make both mark dots look the same
                            mark: {
                                borderColor: '#e9ecef', // Use the same color for all marks
                                backgroundColor: '#e9ecef',
                                borderWidth: 1,
                                width: 6,
                                height: 6,
                            },
                            // Override the markFilled style to match the regular mark
                            markFilled: {
                                borderColor: '#e9ecef', // Same as normal mark
                                backgroundColor: '#e9ecef', // Same as normal mark
                                borderWidth: 1,
                                width: 6,
                                height: 6,
                            },
                            // Ensure the bar itself is visible
                            bar: {
                                backgroundColor: '#e9ecef', // Light gray color for the entire bar
                            }
                        })}
                        onChange={(value) => cy && setRankSep(100 * value)} disable={!cy}
                    />
                </Box>
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
                                        fitGraphToViewport("")  // By default, adjust to fill height
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
