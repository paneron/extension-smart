import { Button, FormGroup } from '@blueprintjs/core';
import React from 'react';
import { NormalTextField } from '@/smart/ui/common/fields';

const MeasureListQuickEdit: React.FC<{
  measurements: string[];
  setMeasurements: (x: string[]) => void;
}> = function ({ measurements, setMeasurements }) {
  function addMeasurement() {
    setMeasurements([...measurements, '']);
  }

  function onDelete(index: number) {
    const newM = [...measurements];
    newM.splice(index, 1);
    setMeasurements(newM);
  }

  function setM(index: number, x: string) {
    const newM = [...measurements];
    newM[index] = x;
    setMeasurements(newM);
  }

  return (
    <FormGroup label="Measurement Tests">
      {measurements.map((m, index) => (
        <MeasurementQuickEdit
          key={index}
          measurement={m}
          setMeasurement={x => setM(index, x)}
          onDelete={() => onDelete(index)}
        />
      ))}
      <Button icon="plus" onClick={addMeasurement}>
        Add test
      </Button>
    </FormGroup>
  );
};

const MeasurementQuickEdit: React.FC<{
  measurement: string;
  setMeasurement: (x: string) => void;
  onDelete: () => void;
}> = function ({ measurement, setMeasurement, onDelete }) {
  return (
    <div
      style={{
        position : 'relative',
      }}
    >
      <fieldset>
        <NormalTextField
          text="Test"
          value={measurement}
          onChange={x => setMeasurement(x)}
        />
        <div
          style={{
            position : 'absolute',
            right    : 0,
            top      : -8,
            zIndex   : 10,
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
