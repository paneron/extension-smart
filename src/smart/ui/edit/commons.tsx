import { Button } from '@blueprintjs/core';
import React from 'react';
import MGDButtonGroup from '../../MGDComponents/MGDButtonGroup';
import {
  AddSubprocessButton,
  EditButton,
  RemoveButton,
  RemoveSubprocessButton,
} from '../common/buttons';

export const EditPageButtons: React.FC<{
  onUpdateClick?: () => void;
  onFullEditClick?: () => void;
  onDeleteClick?: () => void;
  onSubprocessClick?: () => void;
  onSubprocessRemoveClick?: () => void;
}> = function ({
  onUpdateClick,
  onDeleteClick,
  onFullEditClick,
  onSubprocessClick,
  onSubprocessRemoveClick,
}) {
  return (
    <MGDButtonGroup>
      {onUpdateClick ? (
        <Button
          icon="floppy-disk"
          intent="success"
          onClick={() => onUpdateClick()}
        >
          Save
        </Button>
      ) : null}
      {onFullEditClick ? <EditButton onClick={onFullEditClick} /> : null}
      {onSubprocessClick ? (
        <AddSubprocessButton callback={onSubprocessClick} />
      ) : null}
      {onSubprocessRemoveClick ? (
        <RemoveSubprocessButton callback={onSubprocessRemoveClick} />
      ) : null}
      {onDeleteClick !== undefined ? (
        <RemoveButton onClick={onDeleteClick} />
      ) : null}
    </MGDButtonGroup>
  );
};
