/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { jsx } from '@emotion/react';
import React, { RefObject } from 'react';
import { EdgeText } from 'react-flow-renderer';
import { MapEdgeResult } from './MappingCalculator';
import { mgd_canvas } from '../../../css/layout';

interface IMappingEdge {
  fx: number;
  fy: number;
  fromid: string;  
  tx: number;
  ty: number;
  toid: string;
  onMappingEdit: (from: string, to: string) => void;
}

function computePos(edgeResult: MapEdgeResult, onMappingEdit: (from: string, to: string) => void):IMappingEdge {
  const {
    fromPos,
    toPos,
    fromref,
    toref,
    fromid,
    toid,
  } = edgeResult;
  if ((fromPos === undefined && fromref.current === null) 
    || (toPos === undefined && toref.current === null)) {
    return {
      fx: 0,
      fy: 0,
      fromid,
      tx: 0,
      ty: 0,
      toid,
      onMappingEdit
    }
  }
  const fPos = fromPos??fromref.current!.getBoundingClientRect();
  const tPos = toPos??toref.current!.getBoundingClientRect();  
  const fx = fPos.x + fPos.width;
  const fy = fPos.y + fPos.height / 2;
  const tx = tPos.x - 5;
  const ty = tPos.y + tPos.height / 2;
  return {
    fx,
    fy,
    fromid,
    tx,
    ty,
    toid,
    onMappingEdit
  }
}

function filterResult(edgeResult: IMappingEdge, threshold: number):boolean {
  const { fx, tx } = edgeResult;  
  return fx < threshold && tx > threshold;
}

const MappingCanvus: React.FC<{
  mapEdges: MapEdgeResult[];
  onMappingEdit: (from: string, to: string) => void;
  line: RefObject<HTMLDivElement>;
}> = function ({ mapEdges, onMappingEdit, line }) {
  const threshold = line.current ? line.current.getBoundingClientRect().x : 0;
  const edges = mapEdges
    .map(r => computePos(r, onMappingEdit))
    .filter(r => filterResult(r, threshold))

  return (
    <div css={mgd_canvas}>
      <svg width="100%" height="99%">
        <defs>
          <marker
            id="triangle"
            viewBox="0 0 10 10"
            refX="1"
            refY="5"
            markerUnits="strokeWidth"
            markerWidth="5"
            markerHeight="5"
            orient="auto"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill="black" />
          </marker>
        </defs>
        {edges.map(r => (
          <MappingEdge {...r} />
        ))}
      </svg>
    </div>
  );
};

const MappingEdge: React.FC<IMappingEdge> = function ({ 
  fx, fy, tx, ty, fromid, toid, onMappingEdit 
}) { 
  const cx = (fx + tx) / 2;
  const cy = (fy + ty) / 2;
  return (
    <>
      <path
        key={'ui#mapline#' + fromid + '#' + toid}
        d={'M' + fx + ',' + fy + ' L' + tx + ',' + ty}
        strokeWidth="1"
        stroke="black"
        fill="#f00"
        markerEnd="url(#triangle)"
      />
      <MappingEdgeRegion
        key={'ui#mapping#removebutton#' + fromid + '#' + toid}
        x={cx}
        y={cy}
        source={fromid}
        target={toid}
        onMappingEdit={onMappingEdit}
      />
    </>
  );
};

const MappingEdgeRegion: React.FC<{
  x: number;
  y: number;
  source: string;
  target: string;
  onMappingEdit: (from: string, to: string) => void;
}> = function ({ x, y, source, target, onMappingEdit }) {
  return (
    <EdgeText
      x={x}
      y={y}
      label="✎"
      labelStyle={{
        display: 'block',
        margin: 'auto',
        fontSize: '16px',
      }}
      labelBgStyle={{
        width: '20px',
        height: '20px',
      }}
      labelBgBorderRadius={10}
      labelBgPadding={[3, 1]}
      onClick={() => onMappingEdit(source, target)}
    />
  );
};

export default MappingCanvus;
