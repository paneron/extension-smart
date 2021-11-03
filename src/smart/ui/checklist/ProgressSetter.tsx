import { Button, ControlGroup, NumericInput } from '@blueprintjs/core';
import React from 'react';
import { useState } from 'react';
import MGDDisplayPane from '../../MGDComponents/MGDDisplayPane';

const ProgressSetter: React.FC<{
  initial: number;
  onSubmit: (x: number) => void;
}> = function ({ initial, onSubmit }) {
  const [value, setValue] = useState<number>(initial);

  function onChange(x: number) {
    if (x < 0) {
      x = 0;
    }
    if (x > 100) {
      x = 100;
    }
    setValue(x);
  }

  return (
    <MGDDisplayPane>
      <ControlGroup>
        <NumericInput
          style={{
            width: 60,
          }}
          min={0}
          max={100}
          value={value}
          onValueChange={x => onChange(x)}
        />
        <Button intent="primary" onClick={() => onSubmit(value)}>
          Set Progress
        </Button>
      </ControlGroup>
    </MGDDisplayPane>
  );
};

export default ProgressSetter;
