import { Button, Group } from '@mantine/core';
import Cytoscape from 'cytoscape';
import { useEffect, useState } from 'react';
import CytoscapeComponent from 'react-cytoscapejs';
// @ts-ignore
import DAGRE from 'cytoscape-dagre';


Cytoscape.use(DAGRE);

//

export function Visualizer({ 
    id,
  }: {
    id: String
  }) {
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
  
          // "text-rotation": "autorotate"
        }
      }
    ] as Array<cytoscape.Stylesheet>;
    const [elements, setElements] = useState([]);
    //Rerender on change of ID
    useEffect(() => {
    //Fetch the json file from the database and build a graph upon it
    const testReturn = fetch(`http://localhost:8081/wf-instances/${id}`)
        .then(res => res.json())
        .then(res => {
            const tasks = res.result.workflow.tasks;
            const graphElements = [];
            var nodeCount = 0;
            const existingNode = new Set<string>();
            tasks.forEach((task: any) => {
              //Create a graph of tasks and files. Tasks are indexed by 'id' and the files are indexed by 'name'
              graphElements.push({data: { id: task.id, label: task.name }})
              nodeCount++;
              task.files.forEach((file: any) => {
                if(!existingNode.has(file.name)) {
                  existingNode.add(file.name);
                  graphElements.push({data: { id: file.name, label: file.name }});
                  nodeCount++;
                }

                if(file.link == "input") {
                  graphElements.push({data: { source: file.name, target: task.id  } });
                } else {
                  graphElements.push({data: { source: task.id, target: file.name  } });
                }
              })
            });
            console.log(nodeCount);
            setElements(graphElements);
        })
      }, (id));
        //Set the layout for the Cytoscape Component
        const layout = { name: 'dagre', animate: true };
    return (
        <>
        <CytoscapeComponent 
          elements={elements}
          layout = {layout}
          style={{ minWidth: '400px', maxWidth: '1250px', height: '700px' }} 
          stylesheet= {cytoscapeStylesheet}/>
        <Group justify="center">
        <Button variant="default">Redraw</Button>

        <Button>Pick Style</Button>
        </Group>
        </>
    );
  }