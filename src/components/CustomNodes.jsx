import React, { useCallback, useMemo } from 'react';
import { Handle } from 'reactflow';

export function TableNode(props) {
  const {
    label, fields = [], theme = 'light', selected, isField, isTable, isParent, fieldName, fieldType,
    onTableClick, onTableDoubleClick, nodeId
  } = props.data;
  const isDark = theme === 'dark';
  const tableNameBg = isDark ? '#222222' : '#3C6795';
  const tableNameFont = '#FFFFFF';
  const fieldBg = isDark ? '#37383F' : '#F2F2F2';
  const fieldNameFont = isDark ? '#C5C5C7' : '#000000';
  const fieldTypeFont = isDark ? '#9A9A9C' : '#A3A3A3';

  const onChange = useCallback((evt) => {
    // You can handle updates here, e.g., update node data in state
    console.log('Input changed:', evt.target.value);
  }, []);

  if (isField) {
    return (
      <div
        style={{
          height: 24,
          padding: '8px 4px',
          background: fieldBg,
          color: fieldNameFont,
          fontSize: 14,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'relative',
          cursor: 'pointer',
        }}
        onClick={() => onTableClick && onTableClick(nodeId)}
        onDoubleClick={e => {
          e.stopPropagation();
          onTableDoubleClick && onTableDoubleClick(nodeId);
        }}
      >
        <Handle
          type="target"
          position="left"
          id="target"
          style={{ background: fieldBg, opacity: 0 }}
        />
        <span style={{ color: fieldNameFont, textAlign: 'left', flex: 1 }}>{fieldName}</span>
        <span style={{ color: fieldTypeFont, textAlign: 'right' }}>{fieldType}</span>
        <Handle
          type="source"
          position="right"
          id="source"
          style={{ background: fieldBg, opacity: 0 }}
        />
      </div>
    );
  }

  // Table node header: acts as drag handle for parent, move cursor
  if (isTable) {
    return (
      <div
        style={{
          height: 19,
          fontWeight: 'bold',
          padding: '8px 4px',
          background: tableNameBg,
          color: tableNameFont,
          fontSize: 14,
          display: 'flex',
          letterSpacing: 1,
          userSelect: 'none',
          cursor: 'pointer',
          borderRadius: 2,
        }}
        onClick={() => onTableClick && onTableClick(nodeId)}
        onDoubleClick={e => {
          e.stopPropagation();
          onTableDoubleClick && onTableDoubleClick(nodeId);
        }}
      >
        <span style={{ color: tableNameFont, textAlign: 'left', flex: 1 }}>{label}</span>
      </div>
    );
  }

  // Parent node: container only, no UI
  if (isParent) {
    return (
      <div
        style={{
          cursor: 'move',
        }}
      >
        <Handle type="target" position="right" style={{ opacity: 0 }} />
        <Handle type="source" position="bottom" style={{ opacity: 0 }} />
        <Handle
          type="target"
          position="left"
          id="target"
          style={{ background: fieldBg, opacity: 0 }}
        />

        <Handle
          type="source"
          position="right"
          id="source"
          style={{ background: fieldBg, opacity: 0 }}
        />
      </div>
    );
  }

  // // Table node rendering
  // return (
  //   <div>
  //     <div
  //       className="table-node"
  //       style={{
  //         overflow: 'hidden',
  //         background: fieldBg,
  //         cursor: 'move'
  //       }}
  //     >
  //       <div
  //         onClick={() => onTableClick && onTableClick(nodeId)}
  //         onDoubleClick={e => {
  //           e.stopPropagation();
  //           onTableDoubleClick && onTableDoubleClick(nodeId);
  //         }}>
  //         {label}
  //       </div>
  //       <div
  //         style={{
  //           fontWeight: 'bold',
  //           padding: '8px 12px',
  //           background: fieldBg,
  //           color: tableNameFont,
  //           fontSize: 14,
  //           letterSpacing: 1,
  //           userSelect: 'none',
  //           cursor: 'pointer'
  //         }}
  //         onClick={() => onTableClick && onTableClick(nodeId)}
  //         onDoubleClick={e => {
  //           e.stopPropagation();
  //           onTableDoubleClick && onTableDoubleClick(nodeId);
  //         }}
  //       >
  //         {label}
  //       </div>
  //       <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
  //         {fields.map((field, idx) => (
  //           <li key={idx} style={{
  //             display: 'flex',
  //             justifyContent: 'space-between',
  //             alignItems: 'center',
  //             padding: '6px 12px',
  //             background: fieldBg,
  //             color: fieldNameFont,
  //             fontSize: 14,
  //           }}>
  //             <span style={{ color: fieldNameFont, textAlign: 'left', flex: 1 }}>{field.name}</span>
  //             <span style={{ color: fieldTypeFont, marginLeft: 8, textAlign: 'right', minWidth: 60 }}>{field.type}</span>
  //           </li>
  //         ))}
  //       </ul>
  //     </div>
  //   </div>
  // );
  // Fallback (should not render)
  return null;
}

export default TableNode;
