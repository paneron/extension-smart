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
