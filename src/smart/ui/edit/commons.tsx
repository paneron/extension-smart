/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { Button } from '@blueprintjs/core';
import { jsx } from '@emotion/react';
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
      ) : (
        <></>
      )}
      {onNewID !== undefined &&
      initID !== undefined &&
      validTest !== undefined ? (
        <PopoverChangeIDButton
          initValue={initID}
          validTest={validTest}
          save={onNewID}
        />
      ) : (
        <></>
      )}
      {onFullEditClick !== undefined ? (
        <EditButton onClick={onFullEditClick} />
      ) : (
        <></>
      )}
      {onSubprocessClick !== undefined ? (
        <AddSubprocessButton callback={onSubprocessClick} />
      ) : (
        <></>
      )}
      {onDeleteClick !== undefined ? (
        <RemoveButton onClick={onDeleteClick} />
      ) : (
        <></>
      )}
    </MGDButtonGroup>
  );
};
