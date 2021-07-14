/** @jsx jsx */

import { jsx } from '@emotion/react';
import styled from '@emotion/styled';
import React, { RefObject } from 'react';
import { AIAgent } from '../../ai/aiagent';
import { StateMan } from '../interface/state';
import { MyTopRightButtons } from './unit/closebutton';

const modelfile: RefObject<HTMLInputElement> = React.createRef();

const AIPane: React.FC<StateMan> = (sm: StateMan) => {
  const state = sm.state;

  const readModelFromFile = (result: string) => {
    console.debug('Transforming XML to model');
    state.history.clear();
    state.modelWrapper = AIAgent.xmlToModel(result);
    sm.setState(state);
  };

  const close = () => {
    state.aivisible = false;
    sm.setState(state);
  };

  return (
    <ControlBar>
      <MyTopRightButtons onClick={() => close()}>X</MyTopRightButtons>

      <button onClick={() => modelfile.current?.click()}>
        Transform XML to Model
      </button>
      <input
        type="file"
        accept=".xml"
        onChange={e => modelFileSelected(e, readModelFromFile)}
        ref={modelfile}
        style={{ display: 'none' }}
      />
    </ControlBar>
  );
};

const ControlBar = styled.aside`
  position: absolute;
  width: 20%;
  height: 30%;
  bottom: 0;
  right: 0%;
  background-color: white;
  border-style: solid;
  font-size: 12px;
  overflow-y: auto;
  z-index: 100;
`;

function modelFileSelected(
  e: React.ChangeEvent<HTMLInputElement>,
  readModel: (x: string) => void
): void {
  const flist = e.target.files;
  if (flist != undefined && flist.length > 0) {
    flist[0].text().then(result => {
      readModel(result);
    });
  }
  e.target.value = '';
}

export default AIPane;
