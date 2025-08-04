import React, { useCallback, useMemo, useState, useRef } from 'react';
import { Handle } from 'reactflow';

export function TableNode(props) {
  const {
    label, fields = [], theme = 'light', selected, isField, isTable, isParent, fieldName, fieldType,
    onTableClick, onTableDoubleClick, nodeId, note, tooltipPosition
  } = props.data;
  const [showNote, setShowNote] = useState(false);

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
    const [showFieldNote, setShowFieldNote] = useState(false);
    const fieldRef = useRef(null);
    const [tooltipPos, setTooltipPos] = useState({ top: 0, left: 0 });

    const handleMouseEnter = () => {
      if (fieldRef.current) {
        setTooltipPos({
          top: 0,
          left: tooltipPosition + 8,
        });
      }
      setShowFieldNote(true);
    };

    return (
      <div
        ref={fieldRef}
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
        <span style={{ color: fieldNameFont, textAlign: 'left', flex: 1, display: 'flex', alignItems: 'center' }}>
          {fieldName}
          {note && (
            <span
              style={{
                marginLeft: 6,
                cursor: 'pointer',
                fontSize: 15,
                display: 'flex',
                alignItems: 'center',
                position: 'relative',
              }}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={() => setShowFieldNote(false)}
              tabIndex={0}
            >
              <span role="img" aria-label="note">🗒️</span>
              {showFieldNote && (
                <div
                  style={{
                    position: 'fixed',
                    top: tooltipPos.top,
                    left: tooltipPos.left,
                    background: isDark ? '#222' : '#fff',
                    color: isDark ? '#ffe082' : '#333',
                    border: `1px solid ${isDark ? '#444' : '#ccc'}`,
                    borderRadius: 4,
                    padding: 8,
                    zIndex: 1001,
                    minWidth: 100,
                    maxWidth: 250,
                    whiteSpace: 'pre-line',
                    fontSize: 8,
                    textAlign: 'left',
                    wordBreak: 'break-word',
                  }}
                >
                  {note}
                </div>
              )}
            </span>
          )}
        </span>
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
        {note && (
          <span
            style={{
              marginLeft: 8,
              cursor: 'pointer',
              fontSize: 16,
              display: 'flex',
              alignItems: 'center',
              position: 'relative',
            }}
            onMouseEnter={() => setShowNote(true)}
            onMouseLeave={() => setShowNote(false)}
            tabIndex={0}
          >
            <span role="img" aria-label="note">🗒️</span>
            {showNote && (
              <div
                style={{
                  position: 'absolute',
                  top: '-8px',
                  left: '100%',
                  marginLeft: 8,
                  background: isDark ? '#222' : '#fff',
                  color: isDark ? '#ffe082' : '#333',
                  border: `1px solid ${isDark ? '#444' : '#ccc'}`,
                  borderRadius: 4,
                  padding: 8,
                  zIndex: 1001,
                  minWidth: 100,
                  maxWidth: 250,
                  whiteSpace: 'pre-line',
                  fontSize: 8,
                  textAlign: 'left', // Ensure left alignment
                  wordBreak: 'break-word', // Ensures long words wrap
                }}
              >
                {note}
              </div>
            )}
          </span>
        )}
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
