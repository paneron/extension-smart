import React from 'react';
import MGDButton from '../../MGDComponents/MGDButton';
import MGDButtonGroup from '../../MGDComponents/MGDButtonGroup';

export const EditPageButtons: React.FC<{
  onUpdateClick: () => void;
  onCancelClick: () => void;
}> = function ({ onUpdateClick, onCancelClick }) {
  return (
    <MGDButtonGroup>
      <MGDButton
        key="ui#itemupdate#savebutton"
        icon="floppy-disk"
        onClick={() => onUpdateClick()}
      >
        Save
      </MGDButton>
      <MGDButton
        key="ui#itemupdate#cancelbutton"
        icon="disable"
        onClick={() => onCancelClick()}
      >
        Cancel
      </MGDButton>
    </MGDButtonGroup>
  );
};
