import React, { useRef, useEffect, useState } from 'react';
import {
  getSmoothStepPath,
  EdgeLabelRenderer,
  BaseEdge,
} from 'reactflow';

// Helper component to render the edge label
function EdgeLabel({ transform, label }) {
  return (
    <div
      style={{
        position: 'absolute',
        padding: '4px 8px',
        color: '#ff5050',
        fontSize: 11,
        fontWeight: 600,
        transform,
        borderRadius: '3px',
        whiteSpace: 'nowrap',
        zIndex: 1000,
        pointerEvents: 'none',
      }}
      className="nodrag nopan"
    >
      {label}
    </div>
  );
}

function hasLabels(data) {
  return (
    typeof data === 'object' &&
    data !== null &&
    (
      ('startLabel' in data && typeof data.startLabel === 'string' && data.startLabel.trim() !== '') ||
      ('endLabel' in data && typeof data.endLabel === 'string' && data.endLabel.trim() !== '')
    )
  );
}

const CustomEdge = ({
  id,
  source,
  target,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data = {},
  speed = 200, // pixels per second (default)
}) => {
  const [edgePath] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  // Calculate path length for speed-based animation
  const pathRef = useRef(null);
  const [duration, setDuration] = useState(2);

  useEffect(() => {
    if (pathRef.current) {
      const length = pathRef.current.getTotalLength();
      setDuration(length / speed); // duration in seconds
    }
  }, [edgePath, speed]);

  // Animate only if this edge is connected to the selected table
  const isAnimated =
    data.selectedTable &&
    (source?.startsWith(data.selectedTable) || target?.startsWith(data.selectedTable));

  // Set edge color: blue if animated, default otherwise
  const edgeColor = isAnimated ? '#2196f3' : '#333';
  const zIndex = isAnimated ? 10000 : 10;

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          stroke: edgeColor,
          strokeWidth: 2,
          zIndex: zIndex, // <-- set zIndex if animated
        }}
      />
      {/* Hidden path for measuring length */}
      <path ref={pathRef} d={edgePath} style={{ display: 'none' }} />
      {isAnimated && (
        <circle r="5" fill="#ff0073">
          <animateMotion dur={`${duration}s`} repeatCount="indefinite" path={edgePath} />
        </circle>
      )}
      <EdgeLabelRenderer>
        {hasLabels(data) && isAnimated && (
          <>
            {data.startLabel && (
              <EdgeLabel
                transform={`translate(+50%, -100%) translate(${sourceX}px,${sourceY}px)`}
                label={data.startLabel}
              />
            )}
            {data.endLabel && (
              <EdgeLabel
                transform={`translate(-100%, -100%) translate(${targetX}px,${targetY}px)`}
                label={data.endLabel}
              />
            )}
          </>
        )}
      </EdgeLabelRenderer>
    </>
  );
};

export default CustomEdge;
