import React, { useState, useCallback, useEffect } from 'react';
import ReactFlow, {
  applyNodeChanges, applyEdgeChanges, addEdge, MiniMap,
  Controls, useNodesState, useEdgesState
} from 'reactflow';
import 'reactflow/dist/style.css';
import TableNode from './CustomNodes.jsx';
import CustomEdgeStartEnd from './CustomEdgeStartEnd.jsx';

const nodeTypes = {
  tableNode: TableNode,
};

const edgeTypes = {
  'start-end': CustomEdgeStartEnd,
};

export default function DiagramViewer({ refnodes = [], refedges = [], onTableClick, onTableDoubleClick, selectedTable, theme, onNodesChange }) {
  // Add handlers and nodeId to each node's data
  const [nodes, setNodes, onNodesChangeInternal] = useNodesState(
    (refnodes || []).map(node => {
      let style = node.style || {};
      // Highlight parent node if selected
      if (node.data?.isParent && selectedTable && node.data?.tableName === selectedTable) {
        style = {
          ...style,
          border: '2px solid yellow',
        };
      }
      return {
        ...node,
        data: {
          ...node.data,
          onTableClick,
          onTableDoubleClick,
          nodeId: node.id,
          selected: selectedTable === node.id,
          theme,
        },
        style,
      };
    })
  );

  useEffect(() => {
    setNodes(
      (refnodes || []).map(node => {
        let style = node.style || {};
        if (node.data?.isParent && selectedTable && node.data?.tableName === selectedTable) {
          style = {
            ...style,
            border: '2px solid yellow',
          };
        }
        return {
          ...node,
          data: {
            ...node.data,
            onTableClick,
            onTableDoubleClick,
            nodeId: node.id,
            selected: selectedTable === node.id,
            theme,
          },
          style,
        };
      })
    );
  }, [refnodes, onTableClick, onTableDoubleClick, selectedTable, theme]);

  const [edges, setEdges, onEdgesChange] = useEdgesState(
    (refedges || []).map(edge => ({
      ...edge,
      data: {
        ...edge.data,
        selectedTable, // Pass the selected table to edge data
      }
    }))
  );

  useEffect(() => {
    setEdges(
      (refedges || []).map(edge => ({
        ...edge,
        data: {
          ...edge.data,
          selectedTable,
        }
      }))
    );
  }, [refedges, selectedTable]);

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
        onNodesChange={onNodesChange} // <--- Use prop
        onEdgesChange={onEdgesChange}
        // onConnect={onConnect}
        fitView
        minZoom={0.01}
        maxZoom={2}
        zoomOnDoubleClick={false}
      >
        {/* <MiniMap /> */}
        <Controls />
      </ReactFlow>
    </div>
  );
}