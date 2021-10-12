import { FormGroup } from '@blueprintjs/core';
import React from 'react';
import MGDButton from '../../MGDComponents/MGDButton';
import { EditorModel } from '../../model/editormodel';
import { measurementValidCheck } from '../../utils/measurement/BasicFunctions';
import { ReferenceSelector } from '../common/fields';
import { IObject } from '../common/listmanagement/listPopoverItem';

export interface IMeasure extends IObject {
  measure: string;
}

export function matchMeasurementFilter(x: IObject, filter: string): boolean {
  const m = x as IMeasure;
  return filter === '' || m.measure.toLowerCase().includes(filter);
}

export const MeasurementItem: React.FC<{
  object: IMeasure;
  model?: EditorModel;
  setObject: (obj: IMeasure) => void;
}> = ({ object: measure, model, setObject: setMeasure }) => {
  const types = Object.values(model!.vars).map(v => v.id);

  return (
    <FormGroup>
      <ReferenceSelector
        key="field#measurementText"
        text="Measurement validation"
        filterName="Measurement filter"
        editable={true}
        value={measure.measure}
        options={types}
        update={(x: number) => {
          measure.measure += '[' + types[x] + ']';
          setMeasure({ ...measure });
        }}
        onChange={(x: string) => {
          measure.measure = x;
          setMeasure({ ...measure });
        }}
      />
      <MGDButton
        key="ui#itemupdate#checkbutton"
        icon="diagnosis"
        onClick={() => measurementValidCheck(measure.measure, model!.vars)}
      >
        Expression Validator
      </MGDButton>
    </FormGroup>
  );
};
