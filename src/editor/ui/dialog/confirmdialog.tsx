import { Button, ButtonGroup } from '@blueprintjs/core';
import React from 'react';

export const ConfirmDialog: React.FC<{
  callback: () => void;
  cancel: () => void;
  msg: string;
}> = function ({ callback, cancel, msg }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <p> {msg} </p>
      <ButtonGroup>
        <Button
          key="ui#dialog#confirmbutton"
          icon="confirm"
          intent="danger"
          text="Confirm"
          onClick={() => callback()}
        />
        <Button
          key="ui#dialog#confirmbutton"
          icon="disable"
          text="Cancel"
          onClick={() => cancel()}
        />
      </ButtonGroup>
    </div>
  );
};
