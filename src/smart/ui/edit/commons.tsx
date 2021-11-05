import { Button } from '@blueprintjs/core';
import React from 'react';
import MGDButtonGroup from '../../MGDComponents/MGDButtonGroup';
import {
  AddSubprocessButton,
  EditButton,
  RemoveButton,
} from '../common/buttons';
import PopoverChangeIDButton from '../popover/PopoverChangeIDButton';

export const EditPageButtons: React.FC<{
  onUpdateClick?: () => void;
  onFullEditClick?: () => void;
  onDeleteClick?: () => void;
  onSubprocessClick?: () => void;
  onNewID?: (id: string) => void;
  initID?: string;
  validTest?: (id: string) => boolean;
}> = function ({
  onUpdateClick,
  onDeleteClick,
  onFullEditClick,
  onSubprocessClick,
  onNewID,
  initID,
  validTest,
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
      {onNewID !== undefined &&
      initID !== undefined &&
      validTest !== undefined ? (
        <PopoverChangeIDButton
          initValue={initID}
          validTest={validTest}
          save={onNewID}
        />
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
