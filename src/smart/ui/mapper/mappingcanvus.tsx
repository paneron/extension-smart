import React, { RefObject } from 'react';
import {
  MapDiffEdgeResult,
  MapDiffType,
  MapDiffValues,
} from '../../utils/map/MappingCalculator';
import { mgdCanvas } from '../../../css/layout';
import { LegendInterface } from '../../model/States';

export const MapDiffStyles: Record<MapDiffType, LegendInterface> = {
  new: { label: 'New mapping', color: 'green' },
  same: {
    label: 'Same mapping',
    color: 'blue',
  },
  delete: {
    label: 'Deleted mapping',
    color: 'red',
  },
};

function colors(type: MapDiffType) {
  return MapDiffStyles[type].color;
}

function markerName(type: MapDiffType): string {
  return `triangle-${type}`;
}

interface IMappingEdge {
  fx: number;
  fy: number;
  fromid: string;
  tx: number;
  ty: number;
  toid: string;
  type: MapDiffType;
}

function computePos(edgeResult: MapDiffEdgeResult): IMappingEdge {
  const { fromref, toref, fromid, toid, type } = edgeResult;
  if (fromref.current === null || toref.current === null) {
    return {
      fx: 0,
      fy: 0,
      fromid,
      tx: 0,
      ty: 0,
      toid,
      type,
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
    type,
  };
}

function filterResult(edgeResult: IMappingEdge, threshold: number): boolean {
  const { fx, tx } = edgeResult;
  return fx < threshold && tx > threshold;
}

const MappingCanvus: React.FC<{
  mapEdges: MapDiffEdgeResult[];
  line: RefObject<HTMLDivElement>;
}> = function ({ mapEdges, line }) {
  const threshold = line.current ? line.current.getBoundingClientRect().x : 0;
  const edges = mapEdges
    .map(r => computePos(r))
    .filter(r => filterResult(r, threshold));
  return (
    <div style={mgdCanvas}>
      <svg width="100%" height="99%">
        <defs>
          {MapDiffValues.map(x => (
            <Marker key={x} type={x} />
          ))}
        </defs>
        {edges.map(r => (
          <MappingEdge key={r.fromid + '#' + r.toid} {...r} />
        ))}
      </svg>
    </div>
  );
};

const Marker: React.FC<{
  type: MapDiffType;
}> = ({ type }) => (
  <marker
    id={markerName(type)}
    viewBox="0 0 10 10"
    refX="1"
    refY="5"
    markerUnits="strokeWidth"
    markerWidth="5"
    markerHeight="5"
    orient="auto"
    style={{ stroke: colors(type) }}
  >
    <path d="M 0 0 L 10 5 L 0 10 z" fill={colors(type)} />
  </marker>
);

const MappingEdge: React.FC<IMappingEdge> = function ({
  fx,
  fy,
  tx,
  ty,
  type,
}) {
  return (
    <>
      <path
        d={'M' + fx + ',' + fy + ' L' + tx + ',' + ty}
        strokeWidth="2"
        stroke={colors(type)}
        fill="#f00"
        markerEnd={`url(#${markerName(type)})`}
      />
    </>
  );
};

export default MappingCanvus;
