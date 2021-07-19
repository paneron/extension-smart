/** @jsx jsx */

import { jsx } from '@emotion/react';
import styled from '@emotion/styled';
import React, { CSSProperties } from 'react';

export enum MappedType {
  FULL = 2,
  PARTIAL = 1,
  None = 0,
}

const Legend: React.FC<{ color: string; text: string }> = ({ color, text }) => {
  const css: CSSProperties = {
    height: '12px',
    float: 'left',
    width: '12px',
    border: '1px solid black',
  };
  css.backgroundColor = color;
  return (
    <div>
      {' '}
      <div style={css} /> {text}{' '}
    </div>
  );
};

export function getMapResultColor(x: MappedType): string {
  if (x === MappedType.FULL) {
    return 'lightgreen';
  }
  if (x === MappedType.PARTIAL) {
    return 'lightyellow';
  }
  // not match
  return '#E9967A';
}

const LegendLabel = styled.div`
  position: absolute;
  top: 20px;
  right: 1%;
  font-size: 12px;
  overflow-y: auto;
  z-index: 90;
`;

const MappingLegendPane: React.FC = () => {
  const legs = [MappedType.FULL, MappedType.PARTIAL, MappedType.None];
  const desc = ['Fully mapped', 'Partially mapped', 'Not mapped'];
  const elms: Array<JSX.Element> = [];
  for (let i = 0; i < legs.length; i++) {
    elms.push(
      <Legend
        key={'ui#maplegend#' + i}
        color={getMapResultColor(legs[i])}
        text={desc[i]}
      />
    );
  }

  return <LegendLabel key="ui#maplegendlabel">{elms}</LegendLabel>;
};

export default MappingLegendPane;
