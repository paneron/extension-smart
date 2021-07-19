import styled from '@emotion/styled';
import React, { CSSProperties } from 'react';
import { StateMan } from '../interface/state';
import { MeasureRType } from '../model/measure/measureChecker';
import { FilterType } from './filtermanager';

const LegendPane: React.FC<StateMan> = (sm: StateMan) => {
  const state = sm.state;
  const elms: Array<JSX.Element> = [];
  if (state.mtestResult !== null) {
    const legs = [
      MeasureRType.OK,
      MeasureRType.CONTAINERROR,
      MeasureRType.ERRORSOURCE,
    ];
    const desc = ['Test passed', 'Component failed', 'Test failed'];
    for (let i = 0; i < legs.length; i++) {
      elms.push(
        <Legend
          key={'ui#legend#' + i}
          color={getMeasureResultColor(legs[i])}
          text={desc[i]}
        />
      );
    }
  } else if (state.fpvisible) {
    const legs = [FilterType.EXACT_MATCH, FilterType.SUBPROCESS_MATCH];
    const desc = ['Filter match', 'Component match'];
    for (let i = 0; i < legs.length; i++) {
      elms.push(
        <Legend
          key={'ui#legend#' + i}
          color={getFilterColor(legs[i])}
          text={desc[i]}
        />
      );
    }
  }

  return <LegendLabel key="ui#legendlabel">{elms}</LegendLabel>;
};

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

export function getMeasureResultColor(x: MeasureRType): string {
  if (x === MeasureRType.OK) {
    return 'lightgreen';
  }
  if (x === MeasureRType.ERRORSOURCE) {
    return '#E9967A';
  }
  // MeasureRType.CONTAINERROR
  return 'lightyellow';
}

export function getFilterColor(x: FilterType): string {
  if (x === FilterType.EXACT_MATCH) {
    return 'lightblue';
  }
  if (x === FilterType.SUBPROCESS_MATCH) {
    return 'lightyellow';
  }
  // others
  return 'none';
}

const LegendLabel = styled.div`
  position: absolute;
  top: 20px;
  left: 1%;
  font-size: 12px;
  overflow-y: auto;
  z-index: 90;
`;

export default LegendPane;
