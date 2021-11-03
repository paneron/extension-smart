import { Button, FormGroup } from '@blueprintjs/core';
import React from 'react';
import { DataType } from '../../../serialize/interface/baseinterface';
import { findUniqueID } from '../../../utils/ModelFunctions';
import { NormalTextField } from '../../common/fields';
import { IMeasure } from '../measurementExpressionEdit';

const MeasureListQuickEdit: React.FC<{
  measurements: Record<string, IMeasure>;
  setMeasurements: (x: Record<string, IMeasure>) => void;
}> = function ({ measurements, setMeasurements }) {
  function addMeasurement() {
    const id = findUniqueID('test', measurements);
    measurements[id] = {
      id,
      datatype: DataType.VARIABLE,
      measure: '',
    };
    setMeasurements({ ...measurements });
  }

  return (
    <FormGroup label="Measurement Tests">
      {Object.entries(measurements).map(([index, m]) => (
        <MeasurementQuickEdit
          key={index}
          measurement={m}
          setMeasurement={x => {
            measurements[index] = x;
            setMeasurements({ ...measurements });
          }}
          onDelete={() => {
            delete measurements[index];
            setMeasurements({ ...measurements });
          }}
        />
      ))}
      <Button icon="plus" onClick={addMeasurement}>
        Add test
      </Button>
    </FormGroup>
  );
};

const MeasurementQuickEdit: React.FC<{
  measurement: IMeasure;
  setMeasurement: (x: IMeasure) => void;
  onDelete: () => void;
}> = function ({ measurement, setMeasurement, onDelete }) {
  return (
    <div
      style={{
        position: 'relative',
      }}
    >
      <fieldset>
        <NormalTextField
          text="Test"
          value={measurement.measure}
          onChange={x => setMeasurement({ ...measurement, measure: x })}
        />
        <div
          style={{
            position: 'absolute',
            right: 0,
            top: -8,
            zIndex: 10,
          }}
        >
          <Button intent="danger" onClick={onDelete}>
            Delete
          </Button>
        </div>
      </fieldset>
    </div>
  );
};

export default MeasureListQuickEdit;
