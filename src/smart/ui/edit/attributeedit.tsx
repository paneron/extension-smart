/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { jsx } from '@emotion/react';
import React from 'react';
import {
  EditorModel,
  isEditorDataClass,
  isEditorRegistry,
} from '../../model/editormodel';
import { MMELObject } from '../../serialize/interface/baseinterface';
import { MMELDataAttribute } from '../../serialize/interface/datainterface';
import {
  getReferenceDCTypeName,
  referenceSorter,
} from '../../utils/commonfunctions';
import { DATATYPE, MODAILITYOPTIONS } from '../../utils/constants';
import { createDataAttribute } from '../../utils/EditorFactory';
import {
  MultiReferenceSelector,
  NormalComboBox,
  NormalTextField,
  ReferenceSelector,
} from '../common/fields';
import ListWithPopoverItem, {
  IObject,
} from '../common/listmanagement/listPopoverItem';

const AttributeEditPage: React.FC<{
  attributes: Record<string, MMELDataAttribute>;
  setAtts: (x: Record<string, MMELDataAttribute>) => void;
  model: EditorModel;
}> = ({ attributes, setAtts, model }) => {
  function matchFilter(x: IObject, filter: string): boolean {
    const att = x as MMELDataAttribute;
    return (
      filter === '' ||
      att.id.toLowerCase().indexOf(filter) !== -1 ||
      att.definition.toLowerCase().indexOf(filter) !== -1
    );
  }

  return (
    <ListWithPopoverItem
      items={attributes}
      setItems={x => setAtts(x as Record<string, MMELDataAttribute>)}
      model={model}
      initObject={createDataAttribute('')}
      matchFilter={matchFilter}
      filterName="Attribute filter"
      Content={AttributeItem}
      label="Attributes"
    />
  );
};

const AttributeItem: React.FC<{
  object: MMELObject;
  model: EditorModel;
  setObject: (obj: MMELObject) => void;
}> = ({ object, model, setObject }) => {
  const att = object as MMELDataAttribute;

  const types = [...DATATYPE];
  for (const x in model.elements) {
    const elm = model.elements[x];
    if (isEditorRegistry(elm)) {
      types.push(elm.data);
      types.push(getReferenceDCTypeName(elm.data));
    } else if (isEditorDataClass(elm) && elm.mother === '') {
      types.push(elm.id);
    }
  }

  for (const x in model.enums) {
    const en = model.enums[x];
    types.push(en.id);
  }

  const refs = Object.values(model.refs)
    .sort(referenceSorter)
    .map(r => r.id);

  return (
    <>
      <NormalTextField
        key="field#attributeid"
        text="Attribute ID"
        value={att.id}
        onChange={(x: string) => {
          att.id = x.replaceAll(/\s+/g, '');
          setObject({ ...att });
        }}
      />
      <NormalTextField
        key="field#attributedefinition"
        text="Attribute Definition"
        value={att.definition}
        onChange={(x: string) => {
          att.definition = x;
          setObject({ ...att });
        }}
      />
      <NormalTextField
        key="field#attributeCardinality"
        text="Attribute Cardinality"
        value={att.cardinality}
        onChange={x => {
          att.cardinality = x;
          setObject({ ...att });
        }}
      />
      <NormalComboBox
        key="field#attributeModality"
        text="Attribute Modality"
        value={att.modality}
        options={MODAILITYOPTIONS}
        onChange={x => {
          att.modality = x;
          setObject({ ...att });
        }}
      />
      <ReferenceSelector
        key="field#attributeType"
        text="Attribute Type"
        filterName="Type filter"
        value={att.type}
        options={types}
        update={(x: number) => {
          att.type = types[x];
          setObject({ ...att });
        }}
      />
      <MultiReferenceSelector
        key="field#attributeReference"
        text="Reference"
        options={refs}
        values={att.ref}
        filterName="Reference filter"
        add={x => {
          att.ref = new Set([...att.ref, ...x]);
          setObject({ ...att });
        }}
        remove={x => {
          att.ref = new Set([...att.ref].filter(s => !x.has(s)));
          setObject({ ...att });
        }}
      />
    </>
  );
};

export default AttributeEditPage;
