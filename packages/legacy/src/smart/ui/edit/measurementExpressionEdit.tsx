import { Button, FormGroup } from '@blueprintjs/core';
import React from 'react';
import { EditorModel } from '../../model/editormodel';
import { measurementValidCheck } from '../../utils/measurement/BasicFunctions';
import { ReferenceSelector } from '../common/fields';
import { IMMELObject } from '../common/listmanagement/listPopoverItem';

export type IMeasure = IMMELObject & {
  measure: string;
}

export function matchMeasurementFilter(x: IMMELObject, filter: string): boolean {
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
      <Button
        icon="diagnosis"
        onClick={() => measurementValidCheck(measure.measure, model!.vars)}
      >
        Expression Validator
      </Button>
    </FormGroup>
  );
};
