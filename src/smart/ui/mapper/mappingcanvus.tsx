/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { jsx } from '@emotion/react';
import React, { RefObject } from 'react';
import { MapEdgeResult } from '../../utils/map/MappingCalculator';
import { mgd_canvas } from '../../../css/layout';
import { CSSROOTVARIABLES } from '../../../css/root.css';

const color = CSSROOTVARIABLES['--colour--green'];

interface IMappingEdge {
  fx: number;
  fy: number;
  fromid: string;
  tx: number;
  ty: number;
  toid: string;
}

function computePos(edgeResult: MapEdgeResult): IMappingEdge {
  const { fromref, toref, fromid, toid } = edgeResult;
  if (fromref.current === null || toref.current === null) {
    return {
      fx: 0,
      fy: 0,
      fromid,
      tx: 0,
      ty: 0,
      toid,
    };
  }
  const fPos = fromref.current.getBoundingClientRect();
  const tPos = toref.current.getBoundingClientRect();
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
  };
}

function filterResult(edgeResult: IMappingEdge, threshold: number): boolean {
  const { fx, tx } = edgeResult;
  return fx < threshold && tx > threshold;
}

const MappingCanvus: React.FC<{
  mapEdges: MapEdgeResult[];
  line: RefObject<HTMLDivElement>;
}> = function ({ mapEdges, line }) {
  const threshold = line.current ? line.current.getBoundingClientRect().x : 0;
  const edges = mapEdges
    .map(r => computePos(r))
    .filter(r => filterResult(r, threshold));
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
            style={{ stroke: color }}
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
  fx,
  fy,
  tx,
  ty,
  fromid,
  toid,
}) {
  return (
    <>
      <path
        key={'ui#mapline#' + fromid + '#' + toid}
        d={'M' + fx + ',' + fy + ' L' + tx + ',' + ty}
        strokeWidth="1"
        stroke={color}
        fill="#f00"
        markerEnd="url(#triangle)"
      />
    </>
  );
};

export default MappingCanvus;
