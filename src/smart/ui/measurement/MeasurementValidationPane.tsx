/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { IToastProps } from '@blueprintjs/core';
import { jsx } from '@emotion/react';
import { useState } from 'react';
import MGDButton from '../../MGDComponents/MGDButton';
import MGDSidebar from '../../MGDComponents/MGDSidebar';
import { EditorModel } from '../../model/editormodel';
import { ViewFunctionInterface } from '../../model/ViewFunctionModel';
import {
  MMELVariable,
  VarType,
} from '../../serialize/interface/supportinterface';
import { measureTest } from '../../utils/measurement/Checker';
import { NormalTextField } from '../common/fields';

const MeasureCheckPane: React.FC<{
  model: EditorModel;
  setView: (view: ViewFunctionInterface) => void;
  showMsg: (msg: IToastProps) => void;
}> = function ({ model, setView, showMsg }) {
  const [values, setValues] = useState<Record<string, string>>({});

  const alldata = Object.values(model.vars).filter(
    v => v.type === VarType.DATA || v.type === VarType.LISTDATA
  );

  function getDesc(v: MMELVariable) {
    return (
      v.description +
      (v.type === VarType.LISTDATA ? ' (Seperate the values by ,)' : '')
    );
  }

  return (
    <MGDSidebar>
      {alldata.map(v => (
        <NormalTextField
          key={'field#measurment#' + v.id}
          text={getDesc(v)}
          value={values[v.id] ?? ''}
          onChange={x => {
            values[v.id] = x;
            setValues({ ...values });
          }}
        />
      ))}
      <MGDButton
        icon="lab-test"
        onClick={() => measureTest(model, values, setView, showMsg)}
      >
        Measurement Test
      </MGDButton>
    </MGDSidebar>
  );
};

export default MeasureCheckPane;
