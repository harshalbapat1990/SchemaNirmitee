import React from 'react';
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
        // background: 'rgba(255, 255, 255, 0.9)',
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
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data = {},
}) => {
  const [edgePath] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  console.log('CustomEdgeStartEnd data:', data);

  return (
    <>
      <BaseEdge id={id} path={edgePath} />
      <EdgeLabelRenderer>
        {hasLabels(data) && (
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
