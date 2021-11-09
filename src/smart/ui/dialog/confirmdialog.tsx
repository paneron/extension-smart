import { Button } from '@blueprintjs/core';
import React from 'react';
import MGDButtonGroup from '../../MGDComponents/MGDButtonGroup';

export const ConfirmDialog: React.FC<{
  callback: () => void;
  cancel: () => void;
  msg: string;
}> = function ({ callback, cancel, msg }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <p> {msg} </p>
      <MGDButtonGroup>
        <Button intent="danger" icon="confirm" onClick={() => callback()}>
          Confirm
        </Button>
        <Button icon="disable" onClick={() => cancel()}>
          Cancel
        </Button>
      </MGDButtonGroup>
    </div>
  );
};
