import { Button } from '@blueprintjs/core';
import React from 'react';
import MGDButtonGroup from '../../MGDComponents/MGDButtonGroup';
import {
  AddSubprocessButton,
  EditButton,
  RemoveButton,
} from '../common/buttons';

export const EditPageButtons: React.FC<{
  onUpdateClick?: () => void;
  onFullEditClick?: () => void;
  onDeleteClick?: () => void;
  onSubprocessClick?: () => void;
}> = function ({
  onUpdateClick,
  onDeleteClick,
  onFullEditClick,
  onSubprocessClick,
}) {
  return (
    <MGDButtonGroup>
      {onUpdateClick !== undefined ? (
        <Button
          icon="floppy-disk"
          intent="success"
          onClick={() => onUpdateClick()}
        >
          Save
        </Button>
      ) : null}
      {onFullEditClick !== undefined ? (
        <EditButton onClick={onFullEditClick} />
      ) : null}
      {onSubprocessClick !== undefined ? (
        <AddSubprocessButton callback={onSubprocessClick} />
      ) : null}
      {onDeleteClick !== undefined ? (
        <RemoveButton onClick={onDeleteClick} />
      ) : null}
    </MGDButtonGroup>
  );
};
