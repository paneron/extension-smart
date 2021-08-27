/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { jsx } from '@emotion/react';
import React from 'react';

import {
  EdgeProps,
  EdgeText,
  getEdgeCenter,
  getSmoothStepPath,
  getBezierPath,
  Position,
} from 'react-flow-renderer';
import { CSSROOTVARIABLES } from '../../../css/root.css';
import { DataLinkNodeData, EdgePackage } from '../../model/FlowContainer';

const SandyBrown = CSSROOTVARIABLES['--colour--sandy-brown'];
const Black = CSSROOTVARIABLES['--colour--black'];

const MARKERHALFWIDTH = 3;
const MARKERHEIGHT = 4;

export const DataLinkEdge: React.FC<EdgeProps> = function ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
}) {
  const dldata = data as DataLinkNodeData;
  const edgePath = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });
  const color = dldata.isLinkBetweenData ? SandyBrown : Black;
  return (
    <>
      <path
        style={{ stroke: color }}
        id={id}
        className="react-flow__edge-path"
        d={edgePath}
      />
    </>
  );
};

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
        style={{ stroke: Black }}
        className="react-flow__edge-path"
        d={edgePath1}
      />
      <path
        id={id + 2}
        style={{ stroke: Black }}
        className="react-flow__edge-path"
        d={edgePath2}
      />
      <path
        id={id + 3}
        style={{ stroke: Black }}
        className="react-flow__edge-path"
        d={edgePath3}
      />
      <path
        id={id + 4}
        style={{ stroke: Black }}
        className="react-flow__edge-path"
        d={edgePath4}
      />
      <Marker x={targetX} y={targetY} />
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
  data,
  label,
}) {
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
          style={{ stroke: Black }}
          className="react-flow__edge-path"
          d={edgePath1}
        />
        <EdgeLabel
          payload={data as EdgePackage}
          x={centerX}
          y={centerY}
          label={label}
          keytext={source + '#' + target}
        />
        <Marker x={targetX} y={targetY} />
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
        style={{ stroke: Black }}
        className="react-flow__edge-path"
        d={edgePath1}
      />
      <path
        id={id + 2}
        style={{ stroke: Black }}
        className="react-flow__edge-path"
        d={edgePath2}
      />
      <path
        id={id + 3}
        style={{ stroke: Black }}
        className="react-flow__edge-path"
        d={edgePath3}
      />
      <path
        id={id + 4}
        style={{ stroke: Black }}
        className="react-flow__edge-path"
        d={edgePath4}
      />
      <Marker x={targetX} y={targetY} />
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

const Marker: React.FC<{
  x: number;
  y: number;
  color?: string;
}> = function ({ x, y, color = Black }) {
  return (
    <polygon
      points={`
      ${x - MARKERHALFWIDTH},${y - MARKERHEIGHT}
      ${x + MARKERHALFWIDTH},${y - MARKERHEIGHT}
      ${x},${y}
    `}
      style={{ fill: color }}
    />
  );
};
