import React from 'react';
import { EditorDataClass, EditorRegistry } from '../../../model/editormodel';
import { MMELDataAttribute } from '@paneron/libmmel/interface/datainterface';
import { MMELReference } from '@paneron/libmmel/interface/supportinterface';
import { AttributeList, ReferenceList } from './ComponentList';
import { DescriptionItem, NonEmptyFieldDescription } from './fields';

export const DescribeRegistry: React.FC<{
  reg: EditorRegistry;
  getRefById?: (id: string) => MMELReference | null;
  getDataClassById: (id: string) => EditorDataClass | null;
  CustomAttribute?: React.FC<{
    att: MMELDataAttribute;
    getRefById?: (id: string) => MMELReference | null;
    dcid: string;
  }>;
}> = function ({ reg, getRefById, getDataClassById, CustomAttribute }) {
  const dc = getDataClassById(reg.data);
  return (
    <>
      <DescriptionItem label="ID" value={reg.id} />
      <DescriptionItem label="Title" value={reg.title} />
      {dc !== null && (
        <DescribeDC
          dc={dc}
          getRefById={getRefById}
          CustomAttribute={CustomAttribute}
        />
      )}
    </>
  );
};

export const DescribeDC: React.FC<{
  dc: EditorDataClass;
  getRefById?: (id: string) => MMELReference | null;
  CustomAttribute?: React.FC<{
    att: MMELDataAttribute;
    getRefById?: (id: string) => MMELReference | null;
    dcid: string;
  }>;
}> = function ({ dc, getRefById, CustomAttribute }) {
  return (
    <>
      <AttributeList
        attributes={dc.attributes}
        getRefById={getRefById}
        CustomAttribute={CustomAttribute}
        dcid={dc.id}
      />
    </>
  );
};

export const DescribeAttribute: React.FC<{
  att: MMELDataAttribute;
  getRefById?: (id: string) => MMELReference | null;
}> = function ({ att, getRefById }) {
  const minimal = getRefById === undefined;
  return (
    <>
      <DescriptionItem
        label={minimal ? undefined : 'Attribute ID'}
        value={att.id}
      />
      {!minimal && <NonEmptyFieldDescription label="Type" value={att.type} />}
      {!minimal && (
        <NonEmptyFieldDescription label="Cardinality" value={att.cardinality} />
      )}
      {!minimal && (
        <NonEmptyFieldDescription label="Modality" value={att.modality} />
      )}
      {!minimal && (
        <NonEmptyFieldDescription label="Definition" value={att.definition} />
      )}
      {getRefById !== undefined && (
        <ReferenceList refs={att.ref} getRefById={getRefById} />
      )}
    </>
  );
};
