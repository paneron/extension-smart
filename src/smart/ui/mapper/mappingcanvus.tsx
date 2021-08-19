/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { jsx } from '@emotion/react';
import React from 'react';
import styled from '@emotion/styled';
import { EdgeText } from 'react-flow-renderer'
import { MapEdgeResult } from './MappingCalculator';

const MappingCanvus: React.FC<{
  mapEdges: MapEdgeResult[]  
}> = function ({ mapEdges }) {  
  return (
    <Canvus>
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
        {mapEdges.map(r => 
          <MappingEdge 
            {...r}
          />
        )}
      </svg>
    </Canvus>
  );    
};

const Canvus = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  z-index: 100;
  pointer-events: none;
`;

const MappingEdge: React.FC<MapEdgeResult> = function ({
  fromref,
  toref,
  fromPos,
  toPos,
  fromid,
  toid
}) {
  if (fromPos === undefined || toPos == undefined) {
    if (fromref.current === null || toref.current === null) {
      return <></>
    }
    fromPos = fromref.current.getBoundingClientRect();
    toPos = toref.current.getBoundingClientRect();
  }
  const fx = fromPos.x + fromPos.width;
  const fy = fromPos.y + fromPos.height / 2;
  const tx = toPos.x - 5;
  const ty = toPos.y + toPos.height / 2;
  const cx = (fx + tx) / 2
  const cy = (fy + ty) / 2
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
      <MyDeleteMappingButton 
        key={'ui#mapping#removebutton#' + fromid + '#' + toid}
        x={cx}
        y={cy}          
        source={fromid}
        target={toid}
      />
    </>
  );
}

const MyDeleteMappingButton: React.FC<{
  x:number,
  y:number,
  source:string,
  target:string,  
}> = function ({ x, y, source, target }) {
  return (
    <EdgeText
        x={x}
        y={y}
        label="X"
        labelStyle={{
          display: 'block',
          margin: 'auto'
        }}
        labelBgStyle={{
          width: '20px',
          height: '20px',
          stroke: 'black'
        }}
        labelBgBorderRadius={10}
        labelBgPadding={[7, 5]}
        onClick={() => alert('not implemented')}
      />
  )
}

export default MappingCanvus;
