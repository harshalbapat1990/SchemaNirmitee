import React, { useState, useCallback, useEffect } from 'react';
import ReactFlow, { applyNodeChanges, applyEdgeChanges, addEdge } from 'reactflow';
import 'reactflow/dist/style.css';
import TableNode from './CustomNodes.jsx';

// Hardcoded nodes and edges for a simple diagram
const initialNodes = [
  { id: '1', position: { x: 100, y: 100 }, data: { label: 'Node A' } },
  { id: '2', position: { x: 300, y: 100 }, data: { label: 'Node B' } },
  { id: '3', position: { x: 200, y: 250 }, data: { label: 'Node C' } }
];

const initialEdges = [
  { id: 'e1-2', source: '1', target: '2', type: 'smoothstep' },
  { id: 'e2-3', source: '2', target: '3', type: 'smoothstep' }
];

const nodeTypes = {
  tableNode: TableNode,
};

export default function DiagramViewer({ refnodes = [], refedges = [], onTableClick, onTableDoubleClick, selectedTable }) {
  // Add handlers and nodeId to each node's data
  const [nodes, setNodes] = useState(
    (refnodes || []).map(node => ({
      ...node,
      data: {
        ...node.data,
        onTableClick,
        onTableDoubleClick,
        nodeId: node.id,
        selected: selectedTable === node.id,
      }
    }))
  );

  useEffect(() => {
    setNodes(
      (refnodes || []).map(node => ({
        ...node,
        data: {
          ...node.data,
          onTableClick,
          onTableDoubleClick,
          nodeId: node.id,
          selected: selectedTable === node.id,
        }
      }))
    );
  }, [refnodes, onTableClick, onTableDoubleClick, selectedTable]);

  const [edges, setEdges] = useState(refedges || []);

  useEffect(() => {
    setEdges(refedges || []);
  }, [refedges]);

  const onNodesChange = useCallback(
    (changes) => setNodes((nodesSnapshot) => applyNodeChanges(changes, nodesSnapshot)),
    [],
  );
  const onEdgesChange = useCallback(
    (changes) => setEdges((edgesSnapshot) => applyEdgeChanges(changes, edgesSnapshot)),
    [],
  );
  const onConnect = useCallback(
    (params) => setEdges((edgesSnapshot) => addEdge({ ...params, type: 'smoothstep' }, edgesSnapshot)),
    [],
  );

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
      />
    </div>
  );
}