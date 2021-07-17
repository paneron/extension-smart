/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { jsx } from '@emotion/react';
import styled from '@emotion/styled';
import React from 'react';
import { StateMan } from '../interface/state';
import { functionCollection } from '../util/function';

const PathPane: React.FC<StateMan> = (sm: StateMan) => {
  const state = sm.state;

  const drillup = () => {
    functionCollection.saveLayout();
    const page = state.history.pop();
    state.modelWrapper.page = page;
    sm.setState(state);
  };

  return (
    <>
      <PathLabel key="ui#pathlabel">
        View : {state.history.getPath(sm)}{' '}
      </PathLabel>
      <DrillUpButton key="ui#drillupbutton" onClick={() => drillup()}>
        Drill up
      </DrillUpButton>
    </>
  );
};

const PathLabel = styled.div`
  position: absolute;
  width: 80%;
  top: 0;
  left: 0;
  font-size: 12px;
  overflow-y: auto;
  z-index: 90;
`;

const DrillUpButton = styled.button`
  position: absolute;
  top: 0;
  right: 0%;
  font-size: 12px;
  overflow-y: auto;
  z-index: 90;
`;

export default PathPane;
