import React from 'react';
import { MGDButtonType } from '../../../css/MGDButton';
import MGDButton from '../../MGDComponents/MGDButton';
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
        <MGDButton
          type={MGDButtonType.Primary}
          key="ui#dialog#confirmbutton"
          icon="confirm"
          onClick={() => callback()}
        >
          Confirm
        </MGDButton>
        <MGDButton
          key="ui#dialog#confirmbutton"
          icon="disable"
          onClick={() => cancel()}
        >
          Cancel
        </MGDButton>
      </MGDButtonGroup>
    </div>
  );
};
