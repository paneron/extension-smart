/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { jsx } from '@emotion/react';
import React from 'react';
import { CSSProperties } from 'react';
import { EdgeProps, getSmoothStepPath, Position } from 'react-flow-renderer';

const MARKERWIDTH = 4;
const MARKERHALFHEIGHT = 3;

const RepoEdge: React.FC<EdgeProps> = function ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
}) {
  const color = '#000';
  const style: CSSProperties = {
    stroke: color,
  };
  if (targetX > sourceX) {
    const edgePath1 = getSmoothStepPath({
      sourceX,
      sourceY,
      sourcePosition,
      targetX,
      targetY,
      targetPosition,
    });
    return (
      <>
        <path
          id={id}
          style={style}
          className="react-flow__edge-path"
          d={edgePath1}
        />
        <Marker x={targetX} y={targetY} color={color} />
      </>
    );
  }
  const heightmargin = 60;
  const [dy, dy2] =
    targetY < sourceY
      ? [-1, sourceY - targetY < heightmargin ? -1 : 1]
      : [1, targetY - sourceY < heightmargin ? 1 : -1];
  const p1y: number = sourceY + dy * 10;
  const p1x: number = sourceX + 20;
  const p2y: number = targetY + dy2 * 30;
  const p2x: number = sourceX;
  const p3y: number = targetY + dy2 * 20;
  const p3x: number = targetX - 20;
  const p4y: number = targetY;
  const p4x: number = targetX;
  const edgePath1 = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX: p1x,
    targetY: p1y,
    targetPosition: Position.Top,
  });
  const edgePath2 = getSmoothStepPath({
    sourceX: p1x,
    sourceY: p1y,
    sourcePosition: Position.Bottom,
    targetX: p2x,
    targetY: p2y,
    targetPosition: Position.Right,
  });
  const edgePath3 = getSmoothStepPath({
    sourceX: p2x,
    sourceY: p2y,
    sourcePosition: Position.Left,
    targetX: p3x,
    targetY: p3y,
    targetPosition: Position.Bottom,
  });
  const edgePath4 = getSmoothStepPath({
    sourceX: p3x,
    sourceY: p3y,
    sourcePosition: Position.Top,
    targetX: p4x,
    targetY: p4y,
    targetPosition,
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
      />
      <Marker x={targetX} y={targetY} />
    </>
  );
};

const Marker: React.FC<{
  x: number;
  y: number;
  color?: string;
}> = function ({ x, y, color = '#000' }) {
  return (
    <polygon
      points={`
      ${x - MARKERWIDTH},${y - MARKERHALFHEIGHT}
      ${x - MARKERWIDTH},${y + MARKERHALFHEIGHT}
      ${x},${y}
    `}
      style={{ fill: color }}
    />
  );
};

export default RepoEdge;
