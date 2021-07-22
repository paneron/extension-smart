/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { jsx } from '@emotion/react';
import React from 'react';
import { VarType } from '../../runtime/idManager';
import { MeasureChecker } from '../model/measure/measureChecker';
import { functionCollection } from '../util/function';
import NormalTextField from './unit/textfield';
import { MMELVariable } from '../../serialize/interface/supportinterface';

type EditableVariable = MMELVariable & { type: VarType.DATA | VarType.LISTDATA };
type DerivedVariable = MMELVariable & { type: VarType.DERIVED };

const VariableField: React.FC<{
  variable: EditableVariable,
  val: string,
  onChange?: (newVal: string) => void,
}> =
function ({ variable, val, onChange }) {
  return <NormalTextField
    text={`${variable.description} (separate values with a comma)`}
    update={onChange ? onChange : () => void 0}
    value={val}
  />;
}

const DerivedVariable: React.FC<{ variable: MMELVariable, val: string }> =
function ({ variable, val }) {
  return <>{variable.description}: {val}</>;
}

const MeasureCheckPane: React.FC = () => {
  const sm = functionCollection.getStateMan();
  const model = sm.state.modelWrapper.model;
  const values = sm.state.mtestValues;

  function handleTest() {
    const resolved = MeasureChecker.resolveValues(values);
    const [dead, pathchoice] = MeasureChecker.examineModel(resolved);
    const resulttext = MeasureChecker.markResult(dead, pathchoice);
    sm.state.mtestResult = resulttext;
    sm.setState({ ...sm.state });
  }

  return (
    <>
      {model.vars.filter(v => v.type === VarType.DATA || v.type === VarType.LISTDATA).map(v => (
        <VariableField
          variable={v as EditableVariable}
          val={values.get(v.id) ?? ''}
          onChange={(newVal) => {
            values.set(v.id, newVal);
            sm.setState({ ...sm.state });
          }}
        />
      ))}
      <button onClick={handleTest}>
        Measurement Test
      </button>
      {model.vars.filter(v => v.type === VarType.DERIVED).map(v => (
        <DerivedVariable
          variable={v as DerivedVariable}
          val={values.get(v.id) ?? ''}
        />
      ))}
    </>
  );
};

export default MeasureCheckPane;
