/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { Text, FormGroup, IToastProps } from '@blueprintjs/core';
import { jsx } from '@emotion/react';
import { useMemo, useState } from 'react';
import MGDButton from '../../MGDComponents/MGDButton';
import MGDSidebar from '../../MGDComponents/MGDSidebar';
import { EditorModel } from '../../model/editormodel';
import { MeasureResult } from '../../model/Measurement';
import { ViewFunctionInterface } from '../../model/ViewFunctionModel';
import {
  MMELVariable,
  MMELView,
  VarType,
} from '../../serialize/interface/supportinterface';
import { measureTest } from '../../utils/measurement/Checker';
import updateMeasurementView from './MeasurementResultFormatter';
import updateParaView from './ParameterizedViewFormatter';
import VariableSettingItem from './VariableSettingItem';
import ProfileControl from './ViewProfileControl';

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
  const [profile, setProfile] = useState<MMELView | undefined>(undefined);

  const alldata = Object.values(model.vars).filter(simpleFilter);

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

  function onValueChange(id: string, value: string) {
    values[id] = value;
    setValues({ ...values });
  }

  const profiles = useMemo(() => Object.values(model.views), [model]);

  return (
    <MGDSidebar>
      {branchOnly && profiles.length > 1 && (
        <ProfileControl
          values={values}
          profile={profile}
          profiles={profiles}
          setValues={setValues}
          setProfile={setProfile}
        />
      )}
      <FormGroup>
        {alldata.map(v => (
          <VariableSettingItem
            variable={v}
            value={values[v.id]}
            profile={profile}
            branchOnly={branchOnly}
            onChange={(x: string) => onValueChange(v.id, x)}
          />
        ))}
      </FormGroup>
      {alldata.length > 0 ? (
        <MGDButton
          icon={branchOnly ? 'filter' : 'lab-test'}
          onClick={() =>
            updateResult(measureTest(model, values, showMsg, branchOnly))
          }
        >
          {branchOnly ? 'Custom view' : 'Measurement Test'}
        </MGDButton>
      ) : (
        <Text> No setting detected </Text>
      )}
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
