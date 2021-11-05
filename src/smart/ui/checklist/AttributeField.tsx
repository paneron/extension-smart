import React from 'react';
import { MMELDataAttribute } from '../../serialize/interface/datainterface';
import { MMELReference } from '../../serialize/interface/supportinterface';
import { ReferenceList } from '../common/description/ComponentList';
import { NonEmptyFieldDescription } from '../common/description/fields';
import { CLDescriptionItem } from './CustomFields';

const ChecklistAttribute: React.FC<{
  att: MMELDataAttribute;
  getRefById?: (id: string) => MMELReference | null;
  progress: number;
  onProgressChange: (progress: number) => void;
}> = function ({ att, getRefById, progress, onProgressChange }) {
  function onChange() {
    if (progress === 100) {
      onProgressChange(0);
    } else {
      onProgressChange(100);
    }
  }

  return (
    <CLDescriptionItem
      label={'Attribute ID'}
      value={att.id}
      progress={progress}
      onChange={onChange}
    >
      <NonEmptyFieldDescription label="Type" value={att.type} />
      <NonEmptyFieldDescription label="Cardinality" value={att.cardinality} />
      <NonEmptyFieldDescription label="Modality" value={att.modality} />
      <NonEmptyFieldDescription label="Definition" value={att.definition} />
      {getRefById !== undefined && (
        <ReferenceList refs={att.ref} getRefById={getRefById} />
      )}
    </CLDescriptionItem>
  );
};

export default ChecklistAttribute;
