import { useEffect, useRef, useState, useMemo } from 'react';
import Cytoscape from 'cytoscape';
import CytoscapeComponent from 'react-cytoscapejs';

export function Visualizer() {
    const elements = [
        { data: { id: 'one', label: 'Node 1' }, position: { x: 0, y: 0 } },
       { data: { id: 'two', label: 'Node 2' }, position: { x: 100, y: 0 } },
       { data: { source: 'one', target: 'two', label: 'Edge from Node1 to Node2' } }
    ];

    return(
        <div>
            <h1>Hello</h1>
            <CytoscapeComponent elements={elements} style={{ width: '600px', height: '600px' }} />;
        </div>
    )
}