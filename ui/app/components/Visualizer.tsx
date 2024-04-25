import { Button, Group, Loader } from '@mantine/core';
import Cytoscape, { ElementDefinition } from 'cytoscape';
import CytoscapeComponent from 'react-cytoscapejs';
import DAGRE from 'cytoscape-dagre';
import { useQuery } from '@tanstack/react-query';
import { Task, File, WfInstance } from '~/types/WfInstance';

Cytoscape.use(DAGRE);

export function Visualizer({ id }: { id: string }) {
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
      selector: "node[type = 'file']",
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

    const graphElements: ElementDefinition[] = [];
    const colorMap = new Map<string, string>();

    files.forEach((file: File) => {
      graphElements.push({ data: { id: file.id, label: file.id, bg: '#A9A9A9', type: 'file' } });
    });

    tasks.forEach((task: Task) => {
      let bgColor;
      if (colorMap.has(task.name)) {
        bgColor = colorMap.get(task.name);
      } else {
        bgColor = getRandomColorHex();
        colorMap.set(task.name, bgColor);
      }

      graphElements.push({ data: { id: task.id, label: task.name, bg: bgColor, type: 'task' } });
    
      task.inputFiles?.forEach((fileId: string) => {
        graphElements.push({ data: { source: fileId, target: task.id, type: 'edge' } });
      });

      task.outputFiles?.forEach((fileId: string) => {
        graphElements.push({ data: { source: task.id, target: fileId, type: 'edge' } });
      });
    })

    return graphElements;
  }

  const { isLoading, data: elements, refetch } = useQuery({
    queryKey: ['id', id],
    queryFn: () => 
      fetch(`http://localhost:8081/wf-instances/${id}`)
        .then(res => res.json())
        .then(res => buildGraphElements(res.result))
  });

  return (
    <>
      {isLoading ? (
        <Loader />
      ) : (
        <CytoscapeComponent
          key={elements?.length}
          elements={elements ?? []}
          layout={layout}
          style={{ minWidth: '400px', maxWidth: '1300px', height: '700px' }}
          stylesheet={cytoscapeStylesheet}
        />
      )}
      <Group justify="center">
        <Button variant="default" onClick={() => refetch()}>Shuffle Colors</Button>
      </Group>
    </>
  );
}
