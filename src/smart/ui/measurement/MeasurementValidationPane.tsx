import type { IToastProps } from '@blueprintjs/core';
import { Text, FormGroup, Button } from '@blueprintjs/core';
import React from 'react';
import { useEffect, useMemo, useState } from 'react';
import MGDSidebar from '@/smart/MGDComponents/MGDSidebar';
import type { EditorModel } from '@/smart/model/editormodel';
import type { MeasureResult } from '@/smart/model/Measurement';
import type { ViewFunctionInterface } from '@/smart/model/ViewFunctionModel';
import type {
  MMELVariable,
  MMELView } from '@paneron/libmmel/interface/supportinterface';
import {
  VarType,
} from '@paneron/libmmel/interface/supportinterface';
import { measureTest } from '@/smart/utils/measurement/Checker';
import updateMeasurementView from '@/smart/ui/measurement/MeasurementResultFormatter';
import updateParaView from '@/smart/ui/measurement/ParameterizedViewFormatter';
import VariableSettingItem from '@/smart/ui/measurement/VariableSettingItem';
import ProfileControl from '@/smart/ui/measurement/ViewProfileControl';

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
