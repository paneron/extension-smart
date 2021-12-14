import { Text, FormGroup, IToastProps, Button } from '@blueprintjs/core';
import React from 'react';
import { useEffect, useMemo, useState } from 'react';
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
    v.type === VarType.BOOLEAN ||
    v.type === VarType.TABLEITEM
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
  const [viewOn, setViewOn] = useState<boolean>(false);

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
    if (branchOnly && viewOn) {
      updateResult(measureTest(model, values, showMsg, branchOnly));
    }
  }

  function action() {
    updateResult(measureTest(model, values, showMsg, branchOnly));
    if (branchOnly) {
      setViewOn(true);
    }
  }

  function reset() {
    updateResult(undefined);
    if (branchOnly) {
      setViewOn(false);
    }
  }

  const profiles = useMemo(() => Object.values(model.views), [model]);

  useEffect(() => reset, [branchOnly, model]);

  return (
    <MGDSidebar>
      {branchOnly && profiles.length > 0 && (
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
            key={v.id}
            model={model}
            variable={v}
            value={values[v.id]}
            values={values}
            profile={profile}
            onChange={(x: string) => onValueChange(v.id, x)}
          />
        ))}
      </FormGroup>
      {alldata.length > 0 ? (
        <Button icon={branchOnly ? 'filter' : 'lab-test'} onClick={action}>
          {branchOnly ? 'Custom view' : 'Measurement Test'}
        </Button>
      ) : (
        <Text> No setting detected </Text>
      )}
      {result !== undefined && (
        <Button icon="reset" disabled={result === undefined} onClick={reset}>
          {branchOnly ? 'Reset view' : 'Reset result'}
        </Button>
      )}
    </MGDSidebar>
  );
};

export default MeasureCheckPane;
