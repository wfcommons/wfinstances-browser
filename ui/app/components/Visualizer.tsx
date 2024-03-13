import Cytoscape from 'cytoscape';
import CytoscapeComponent from 'react-cytoscapejs';

export function Visualizer({ 
    id,
  }: {
    id: String
  }) {
    fetch(`localhost:8081/wf-instances/${id}`)
    .then(res => res.json())

    return (
        // Test return
        <CytoscapeComponent elements={[{data: { id: 'a' }}]} style={{ minWidth: '400px', maxWidth: '1250px', height: '700px' }} />
    );
  }