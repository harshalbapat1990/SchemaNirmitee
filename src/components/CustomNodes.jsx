import React, { useCallback, useMemo } from 'react';
import { Handle } from 'reactflow';

export function TableNode(props) {
  const {
    label, fields = [], theme = 'light', selected, isField, fieldName, fieldType,
    onTableClick, onTableDoubleClick, nodeId
  } = props.data;
  const isDark = theme === 'dark';
  const tableNameBg = isDark ? '#222222' : '#3C6795';
  const tableNameFont = '#FFFFFF';
  const fieldBg = isDark ? '#37383F' : '#F2F2F2';
  const fieldNameFont = isDark ? '#C5C5C7' : '#000000';
  const fieldTypeFont = isDark ? '#9A9A9C' : '#A3A3A3';

  // Calculate max width for all fields under a table
  const fieldWidths = useMemo(() => {
    if (isField) return { minWidth: 180, maxWidth: 320, width: '100%' };
    let maxLen = 0;
    fields.forEach(f => {
      const len = (f.name?.length || 0) + (f.type?.length || 0);
      if (len > maxLen) maxLen = len;
    });
    // Estimate width: 8px per char, clamp between 180 and 320
    const px = Math.min(320, Math.max(180, maxLen * 8 + 60));
    return { minWidth: px, maxWidth: px, width: px };
  }, [fields, isField]);

  const onChange = useCallback((evt) => {
    // You can handle updates here, e.g., update node data in state
    console.log('Input changed:', evt.target.value);
  }, []);

  if (isField) {
    return (
      <div
        style={{
          padding: '8px 4px',
          background: fieldBg,
          color: fieldNameFont,
          borderRadius: 6,
          border: `1px solid ${tableNameBg}`,
          fontSize: 13,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxSizing: 'border-box',
          position: 'relative', // required for Handle positioning
          ...fieldWidths,
        }}
        onClick={() => onTableClick && onTableClick(nodeId)}
      >
        {/* Invisible Handles */}
        <Handle
          type="target"
          position="left"
          id="target" // must match edge.targetHandle
          style={{ background: tableNameBg, opacity: 0, pointerEvents: 'none' }}
        />
        <span style={{ color: fieldNameFont, textAlign: 'left', flex: 1 }}>{fieldName}</span>
        <span style={{ color: fieldTypeFont, textAlign: 'right' }}>{fieldType}</span>
        <Handle
          type="source"
          position="right"
          id="source" // must match edge.sourceHandle
          style={{ background: tableNameBg, opacity: 0, pointerEvents: 'none' }}
        />
      </div>
    );
  }

  // Table node rendering (header clickable)
  return (
    <div
      className="table-node"
      style={{
        borderRadius: 8,
        ...fieldWidths,
        boxShadow: selected ? '0 0 0 3px #0078d4' : '0 2px 8px rgba(0,0,0,0.08)',
        overflow: 'hidden',
        border: `2px solid ${tableNameBg}`,
        background: fieldBg,
        cursor: 'move'
      }}
    >
      <div
        style={{
          fontWeight: 'bold',
          padding: '8px 12px',
          background: tableNameBg,
          color: tableNameFont,
          fontSize: 16,
          letterSpacing: 1,
          userSelect: 'none',
          cursor: 'pointer'
        }}
        onClick={() => onTableClick && onTableClick(nodeId)}
        onDoubleClick={() => onTableDoubleClick && onTableDoubleClick(nodeId)}
      >
        {label}
      </div>
      <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
        {fields.map((field, idx) => (
          <li key={idx} style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '6px 12px',
            background: fieldBg,
            color: fieldNameFont,
            fontSize: 13,
            borderBottom: idx < fields.length - 1 ? `1px solid ${isDark ? '#222' : '#eee'}` : 'none',
            boxSizing: 'border-box',
            ...fieldWidths,
          }}>
            <span style={{ color: fieldNameFont, textAlign: 'left', flex: 1 }}>{field.name}</span>
            <span style={{ color: fieldTypeFont, marginLeft: 8, textAlign: 'right', minWidth: 60 }}>{field.type}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default TableNode;
