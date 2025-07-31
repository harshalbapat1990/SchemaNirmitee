import React from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap
} from 'reactflow';
import 'reactflow/dist/style.css';

// Define outside the component
const nodeTypes = {
  // Custom node types here
};

const edgeTypes = {
  // Custom edge types here
};

export default function DiagramViewer({ nodes, edges }) {
  return (
    <div style={{ width: '100%', height: '100%' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
      >
        <Background />
        <Controls />
        <MiniMap />
      </ReactFlow>
    </div>
  );
}