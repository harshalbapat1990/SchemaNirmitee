import React, { useState, useCallback, useEffect } from 'react';
import ReactFlow, { applyNodeChanges, applyEdgeChanges, addEdge, MiniMap,
  Controls, useNodesState, useEdgesState} from 'reactflow';
import 'reactflow/dist/style.css';
import TableNode from './CustomNodes.jsx';
import CustomEdgeStartEnd from './CustomEdgeStartEnd.jsx';

const nodeTypes = {
  tableNode: TableNode,
};

const edgeTypes = {
  'start-end': CustomEdgeStartEnd,
};

export default function DiagramViewer({ refnodes = [], refedges = [], onTableClick, onTableDoubleClick, selectedTable, theme }) {
  // Add handlers and nodeId to each node's data
  const [nodes, setNodes, onNodesChange] = useNodesState(
    (refnodes || []).map(node => ({
      ...node,
      data: {
        ...node.data,
        onTableClick,
        onTableDoubleClick,
        nodeId: node.id,
        selected: selectedTable === node.id,
        theme, 
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
          theme, // <-- ADD THEME HERE TOO
        }
      }))
    );
  }, [refnodes, onTableClick, onTableDoubleClick, selectedTable, theme]); // <-- ADD THEME TO DEPENDENCIES

  const [edges, setEdges, onEdgesChange] = useEdgesState(refedges || []);

  useEffect(() => {
    setEdges(refedges || []);
  }, [refedges]);

  // const onConnect = useCallback(
  //   (params) => setEdges((edgesSnapshot) => addEdge({ ...params, type: 'smoothstep' }, edgesSnapshot)),
  //   [],
  // );

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        // onConnect={onConnect}
        fitView
        minZoom={0.01}
        maxZoom={2}
        zoomOnDoubleClick={false}
      >
      <MiniMap />
      <Controls />
    </ReactFlow>
    </div>
  );
}