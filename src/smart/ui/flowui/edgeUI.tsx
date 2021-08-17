import React from 'react';

import {
  ArrowHeadType,
  EdgeProps,
  EdgeText,
  getEdgeCenter,
  getMarkerEnd,
  getSmoothStepPath,
  Position,
} from 'react-flow-renderer';
import { EdgePackage } from './container';

export const SelfLoopEdge: React.FC<EdgeProps> = function ({
  id,
  source,
  target,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  label,
  data,
  style = {},
  markerEndId,
}) {
  const p1x: number = sourceX + 40;
  const p1y: number = sourceY + 30;
  const p2x: number = sourceX + 100;
  const p2y: number = sourceY;
  const p3x: number = sourceX + 40;
  const p3y: number = targetY - 30;
  const p4x: number = targetX;
  const p4y: number = targetY;
  const edgePath1 = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX: p1x,
    targetY: p1y,
    targetPosition: Position.Left,
  });
  const edgePath2 = getSmoothStepPath({
    sourceX: p1x,
    sourceY: p1y,
    sourcePosition: Position.Right,
    targetX: p2x,
    targetY: p2y,
    targetPosition: Position.Bottom,
  });
  const edgePath3 = getSmoothStepPath({
    sourceX: p2x,
    sourceY: p2y,
    sourcePosition: Position.Top,
    targetX: p3x,
    targetY: p3y,
    targetPosition: Position.Right,
  });
  const edgePath4 = getSmoothStepPath({
    sourceX: p3x,
    sourceY: p3y,
    sourcePosition: Position.Left,
    targetX: p4x,
    targetY: p4y,
    targetPosition,
  });
  const markerEnd = getMarkerEnd(ArrowHeadType.ArrowClosed, markerEndId);
  const [centerX, centerY] = getEdgeCenter({
    sourceX,
    sourceY: p1y,
    targetX: (p1x + p2x) / 2,
    targetY: p1y,
  });
  return (
    <>
      <path
        id={id}
        style={style}
        className="react-flow__edge-path"
        d={edgePath1}
      />
      <path
        id={id + 2}
        style={style}
        className="react-flow__edge-path"
        d={edgePath2}
      />
      <path
        id={id + 3}
        style={style}
        className="react-flow__edge-path"
        d={edgePath3}
      />
      <path
        id={id + 4}
        style={style}
        className="react-flow__edge-path"
        d={edgePath4}
        markerEnd={markerEnd}
      />
      <EdgeLabel
        payload={data as EdgePackage}
        x={centerX}
        y={centerY}
        label={label}
        keytext={source + '#' + target}
      />
    </>
  );
};

export const NormalEdge: React.FC<EdgeProps> = function ({
  id,
  source,
  target,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  data,
  label,
  markerEndId,
}) {
  const markerEnd = getMarkerEnd(ArrowHeadType.ArrowClosed, markerEndId);
  if (targetY > sourceY) {
    const edgePath1 = getSmoothStepPath({
      sourceX,
      sourceY,
      sourcePosition,
      targetX,
      targetY,
      targetPosition,
    });
    const [centerX, centerY] = getEdgeCenter({
      sourceX,
      sourceY,
      targetX,
      targetY,
    });
    return (
      <>
        <path
          id={id}
          style={style}
          className="react-flow__edge-path"
          d={edgePath1}
          markerEnd={markerEnd}
        />
        <EdgeLabel
          payload={data as EdgePackage}
          x={centerX}
          y={centerY}
          label={label}
          keytext={source + '#' + target}
        />
      </>
    );
  }
  const widthmargin = 160;
  let dx = 0;
  let dx2 = 0;
  if (targetX < sourceX) {
    // edge goes to left
    dx = -1;
    dx2 = sourceX - targetX < widthmargin ? -1 : 1;
  } else {
    // targetX >= sourceX
    dx = 1;
    dx2 = targetX - sourceX < widthmargin ? 1 : -1;
  }
  const p1x: number = sourceX + dx * 40;
  const p1y: number = sourceY + 30;
  const p2x: number = targetX + dx2 * 100;
  const p2y: number = sourceY;
  const p3x: number = targetX + dx2 * 40;
  const p3y: number = targetY - 30;
  const p4x: number = targetX;
  const p4y: number = targetY;
  const edgePath1 = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX: p1x,
    targetY: p1y,
    targetPosition: Position.Left,
  });
  const edgePath2 = getSmoothStepPath({
    sourceX: p1x,
    sourceY: p1y,
    sourcePosition: Position.Right,
    targetX: p2x,
    targetY: p2y,
    targetPosition: Position.Bottom,
  });
  const edgePath3 = getSmoothStepPath({
    sourceX: p2x,
    sourceY: p2y,
    sourcePosition: Position.Top,
    targetX: p3x,
    targetY: p3y,
    targetPosition: Position.Right,
  });
  const edgePath4 = getSmoothStepPath({
    sourceX: p3x,
    sourceY: p3y,
    sourcePosition: Position.Left,
    targetX: p4x,
    targetY: p4y,
    targetPosition,
  });
  const [centerX, centerY] = getEdgeCenter({
    sourceX,
    sourceY: p1y,
    targetX: (p1x + p2x) / 2,
    targetY: p1y,
  });
  return (
    <>
      <path
        id={id}
        style={style}
        className="react-flow__edge-path"
        d={edgePath1}
      />
      <path
        id={id + 2}
        style={style}
        className="react-flow__edge-path"
        d={edgePath2}
      />
      <path
        id={id + 3}
        style={style}
        className="react-flow__edge-path"
        d={edgePath3}
      />
      <path
        id={id + 4}
        style={style}
        className="react-flow__edge-path"
        d={edgePath4}
        markerEnd={markerEnd}
      />
      <EdgeLabel
        payload={data as EdgePackage}
        x={centerX}
        y={centerY}
        label={label}
        keytext={source + '#' + target}
      />
    </>
  );
};

const EdgeLabel: React.FC<{
  payload: EdgePackage;
  keytext: string;
  x: number;
  y: number;
  label: React.ReactNode;
}> = function ({ payload, keytext, x, y, label }) {
  const { id, removeEdge } = payload;
  return (
    <>
      {id === '' ? (
        <EdgeText key={'ui#edge#label#' + keytext} x={x} y={y} label={label} />
      ) : (
        <EdgeText
          key={'ui#edge#deletebutton#' + keytext}
          x={x}
          y={y}
          label="X"
          labelStyle={{
            width: '20px',
            height: '20px',
            stroke: 'black',
          }}
          labelBgStyle={{
            display: 'block',
            margin: 'auto',
          }}
          labelBgBorderRadius={10}
          labelBgPadding={[7, 5]}
          onClick={() => removeEdge(id)}
        />
      )}
    </>
  );
};
