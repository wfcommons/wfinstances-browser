import { IconTallymarks } from '@tabler/icons-react';
import Cytoscape from 'cytoscape';
import { useState } from 'react';
import CytoscapeComponent from 'react-cytoscapejs';

export function Visualizer({ 
    id,
  }: {
    id: String
  }) {
    const [elements, setElements] = useState([]);
        const tasks = fetch(`http://localhost:8081/wf-instances/${id}`)
        .then(res => res.json())
        .then(res => {
            const tasks = res.result.workflow.tasks;
            const graphElements = [];
            tasks.forEach((task: any, i: number) => {
                graphElements.push({data: { id: i, label: task.name }})
            });
            setElements(graphElements);
        })
       
        
    return (
        // Test return
        <CytoscapeComponent elements={elements} style={{ minWidth: '400px', maxWidth: '1250px', height: '700px' }} />
    );
  }