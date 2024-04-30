import { Button, Group, Loader, Select } from '@mantine/core';
import Cytoscape, { ElementDefinition } from 'cytoscape';
import { SetStateAction, useEffect, useState, useRef } from 'react';
import { layouts } from './layouts';
import CytoscapeComponent from 'react-cytoscapejs';
import { Modal, Container } from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import { Task, File, WfInstance } from '~/types/WfInstance';
// @ts-ignore
import DAGRE from 'cytoscape-dagre';
import pkg from 'lodash';
const { isEmpty } = pkg;

Cytoscape.use(DAGRE);

function Popup({ obj, open, close }) {
  console.log(obj);
  return (
    <>
    {obj.type === "task" ? (
      <div>
        <Modal title="Node Details" opened={open} onClose={close} size='50%'>
          <Container>
            <div>Name: {obj.label}</div>
            <div>ID: {obj.taskId}</div>
            <div>Read Bytes: {(obj.readBytes > 10485) ? `${(obj.readBytes / (1024 **2)).toFixed(2)} MB` : `${obj.readBytes} Bytes`}</div>
            <div>Written Bytes: {(obj.writtenBytes > 10485) ? `${(obj.writtenBytes / (1024 **2)).toFixed(2)} MB` : `${obj.writtenBytes} Bytes`}</div>
          </Container>
        </Modal>
      </div>
    ) : (
      <div>
        <Modal title="Node Details" opened={open} onClose={close} size='50%'>
          <Container>
            <div>Name: {obj.label}</div>
            <div>Size: {(obj.size > 10485) ? `${(obj.size / (1024 **2)).toFixed(2)} MB` : `${obj.size} Bytes`} </div>
          </Container>
        </Modal>
      </div>
    )}
    </>
  );
}

let modalObj = {};

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
        <>
          <Popup obj = {modalObj} open={open} close={handleClose} />
          <CytoscapeComponent
            key={elements.length}
            elements={elements}
            layout={layout}
            style={{ minWidth: '400px', maxWidth: '1300px', height: '700px' }}
            stylesheet={cytoscapeStylesheet}
            cy={cy => {
              // cyRef.current = cy;
              cy.on("tap", evt => {
                try {
                  modalObj = evt.target.data();
                  if (!(isEmpty(modalObj)) && !(modalObj.type === "edge")) {
                    handleOpen();
                  }
              } catch (error) {
                  console.log("Error; Not a node")
              }
              })
          }}
          />
        </>
      )}
      <Group justify="center">
        <Button variant="default" onClick={() => refetch()}>Shuffle Colors</Button>
      </Group>
    </>
  );
}
