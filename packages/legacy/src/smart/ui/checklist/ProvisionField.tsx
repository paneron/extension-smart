import { Button } from '@blueprintjs/core';
import { Popover2 } from '@blueprintjs/popover2';
import React from 'react';
import {
  MMELProvision,
  MMELReference,
} from '@paneron/libmmel/interface/supportinterface';
import { ReferenceList } from '../common/description/ComponentList';
import { NonEmptyFieldDescription } from '../common/description/fields';
import { CLDescriptionItem } from './CustomFields';
import ProgressSetter from './ProgressSetter';

const ChecklistProvision: React.FC<{
  provision: MMELProvision;
  getRefById?: (id: string) => MMELReference | null;
  progress: number;
  onProgressChange: (progress: number) => void;
}> = function ({ provision, getRefById, progress, onProgressChange }) {
  function onChange() {
    if (progress === 100) {
      onProgressChange(0);
    } else {
      onProgressChange(100);
    }
  }

  function onSetProgress(x: number) {
    onProgressChange(x);
  }

  return (
    <CLDescriptionItem
      label={'Statement'}
      value={provision.condition}
      progress={progress}
      onChange={onChange}
    >
      <NonEmptyFieldDescription label="Modality" value={provision.modality} />
      {getRefById !== undefined && (
        <ReferenceList refs={provision.ref} getRefById={getRefById} />
      )}
      <Popover2
        content={<ProgressSetter initial={progress} onSubmit={onSetProgress} />}
        position="bottom-left"
      >
        <Button>Progress: {progress}%</Button>
      </Popover2>
    </CLDescriptionItem>
  );
};

export default ChecklistProvision;
