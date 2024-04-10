import { Button, Group, Loader, Select } from '@mantine/core';
import Cytoscape from 'cytoscape';
import { SetStateAction, useEffect, useState } from 'react';
import { layouts } from './layouts';
import CytoscapeComponent from 'react-cytoscapejs';
// @ts-ignore
import DAGRE from 'cytoscape-dagre';

Cytoscape.use(DAGRE);

export function Visualizer({ id }: { id: string }) {
  const cytoscapeStylesheet = [
    {
      selector: "node",
      style: {
        "background-color": "#43447a",
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

  const [elements, setElements] = useState<any[]>([]);
  const [layout, setLayout] = useState(layouts.dagre)
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`http://localhost:8081/wf-instances/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const res = await response.json();
        const tasks = res.result.workflow.tasks;
        const graphElements: SetStateAction<any[]> = [];
        const existingNode = new Set<string>();
        tasks.forEach((task: any) => {
          graphElements.push({ data: { id: task.id, label: task.name } });
          task.files.forEach((file: any) => {
            if (!existingNode.has(file.name)) {
              existingNode.add(file.name);
              graphElements.push({ data: { id: file.name, label: file.name } });
            }
            if (file.link === "input") {
              graphElements.push({ data: { source: file.name, target: task.id } });
            } else {
              graphElements.push({ data: { source: task.id, target: file.name } });
            }
          });
        });
        setElements(graphElements);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setIsLoading(false);
      }
    };
    fetchData();
  }, [id]);


  return (
    <>
      {isLoading ? (
        <Loader color="blue" />
      ) : (
        <CytoscapeComponent
          key={elements.length}
          elements={elements}
          layout={layout}
          style={{ minWidth: '400px', maxWidth: '1300px', height: '700px' }}
          stylesheet={cytoscapeStylesheet}
        />
      )}
      <Group justify="center">
        <Button variant="default">Toggle Files Only</Button>
      </Group>
    </>
  );
}
