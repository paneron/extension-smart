import React from 'react';
import type { MMELDataAttribute } from '@paneron/libmmel/interface/datainterface';
import type { MMELReference } from '@paneron/libmmel/interface/supportinterface';
import { ReferenceList } from '@/smart/ui/common/description/ComponentList';
import { NonEmptyFieldDescription } from '@/smart/ui/common/description/fields';
import { CLDescriptionItem } from '@/smart/ui/checklist/CustomFields';

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
