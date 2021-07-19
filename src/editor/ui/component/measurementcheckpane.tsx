/** @jsx jsx */
/** @jsxFrag React.Fragment */

import styled from '@emotion/styled';
import { jsx } from '@emotion/react';
import React from 'react';
import { VarType } from '../../runtime/idManager';
import { MeasureChecker } from '../model/measure/measureChecker';
import { functionCollection } from '../util/function';
import NormalTextField from './unit/textfield';

const MeasureCheckPane: React.FC = () => {
  const sm = functionCollection.getStateMan();
  const model = sm.state.modelWrapper.model;
  const elms: Array<JSX.Element> = [];
  const values = sm.state.mtestValues;

  for (const m of model.vars) {
    if (m.type === VarType.DATA || m.type === VarType.LISTDATA) {
      let v = values.get(m.id);
      if (v === undefined) {
        values.set(m.id, '');
        v = '';
      }
      elms.push(
        <NormalTextField
          key={'field#measurment#' + m.id}
          text={m.description + ' (Seperate the values by ,)'}
          value={v}
          update={(x: string) => {
            values.set(m.id, x);
            sm.setState({ ...sm.state });
          }}
        />
      );
    }
  }
  elms.push(
    <button
      key="ui#measure#valueGen"
      onClick={() => {
        const resolved = MeasureChecker.resolveValues(values);
        const [dead, pathchoice] = MeasureChecker.examineModel(resolved);
        const resulttext = MeasureChecker.markResult(dead, pathchoice);
        sm.state.mtestResult = resulttext;
        sm.setState({ ...sm.state });
      }}
    >
      {' '}
      Measurement Test{' '}
    </button>
  );
  for (const m of model.vars) {
    if (m.type === VarType.DERIVED) {
      let v = values.get(m.id);
      if (v === undefined) {
        v = '';
      }
      elms.push(
        <p key={'field#measurment#' + m.id}>
          {' '}
          {m.description} : {v}{' '}
        </p>
      );
    }
  }

  return (
    <SideBar>
      <h1> Measurement simulation </h1>
      {elms}
    </SideBar>
  );
};

const SideBar = styled.aside`
  position: fixed;
  width: 30%;
  height: 100%;
  bottom: 0;
  right: 0;
  background-color: white;
  border-style: solid;
  font-size: 12px;
  overflow-y: auto;
`;

export default MeasureCheckPane;
