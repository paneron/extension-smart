/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { IToastProps, Switch } from '@blueprintjs/core';
import { jsx } from '@emotion/react';
import { useState } from 'react';
import MGDButton from '../../MGDComponents/MGDButton';
import MGDSidebar from '../../MGDComponents/MGDSidebar';
import { EditorModel } from '../../model/editormodel';
import { MeasureResult } from '../../model/Measurement';
import { ViewFunctionInterface } from '../../model/ViewFunctionModel';
import {
  MMELVariable,
  VarType,
} from '../../serialize/interface/supportinterface';
import { measureTest } from '../../utils/measurement/Checker';
import { NormalTextField } from '../common/fields';
import updateMeasurementView from './MeasurementResultFormatter';
import updateParaView from './ParameterizedViewFormatter';

function simpleFilter(v: MMELVariable): boolean {
  return (
    v.type === VarType.DATA ||
    v.type === VarType.LISTDATA ||
    v.type === VarType.TEXT ||
    v.type === VarType.BOOLEAN
  );
}

const MeasureCheckPane: React.FC<{
  model: EditorModel;
  setView: (view: ViewFunctionInterface | undefined) => void;
  showMsg: (msg: IToastProps) => void;
  branchOnly?: boolean;
}> = function ({ model, setView, showMsg, branchOnly = false }) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [result, setResult] = useState<MeasureResult | undefined>(undefined);

  const alldata = Object.values(model.vars).filter(simpleFilter);

  function getDesc(v: MMELVariable) {
    return (
      v.description +
      (v.type === VarType.LISTDATA ? ' (Seperate the values by ,)' : '')
    );
  }

  function updateResult(x: MeasureResult | undefined) {
    setResult(x);
    if (x !== undefined) {
      if (branchOnly) {
        updateParaView(x, setView);
      } else {
        updateMeasurementView(x, setView);
      }
    } else {
      setView(undefined);
    }
  }

  return (
    <MGDSidebar>
      {alldata.map(v =>
        v.type === VarType.BOOLEAN ? (
          <Switch
            key={(branchOnly ? 'view' : 'measurment') + v.id}
            checked={
              values[v.id] !== undefined ? values[v.id] === 'true' : true
            }
            label={getDesc(v)}
            onChange={x => {
              values[v.id] = x.currentTarget.checked ? 'true' : 'false';
              setValues({ ...values });
            }}
          />
        ) : (
          <NormalTextField
            key={(branchOnly ? 'view' : 'measurment') + v.id}
            text={getDesc(v)}
            value={values[v.id] ?? ''}
            onChange={x => {
              values[v.id] = x;
              setValues({ ...values });
            }}
          />
        )
      )}
      <MGDButton
        icon={branchOnly ? 'filter' : 'lab-test'}
        onClick={() =>
          updateResult(measureTest(model, values, showMsg, branchOnly))
        }
      >
        {branchOnly ? 'Custom view' : 'Measurement Test'}
      </MGDButton>
      {result !== undefined && (
        <MGDButton
          icon="reset"
          disabled={result === undefined}
          onClick={() => updateResult(undefined)}
        >
          {branchOnly ? 'Reset view' : 'Reset result'}
        </MGDButton>
      )}
    </MGDSidebar>
  );
};

export default MeasureCheckPane;
