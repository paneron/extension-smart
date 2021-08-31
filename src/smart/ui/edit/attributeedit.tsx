/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { FormGroup } from '@blueprintjs/core';
import { jsx } from '@emotion/react';
import React from 'react';
import MGDDisplayPane from '../../MGDComponents/MGDDisplayPane';
import {
  EditorModel,
  isEditorDataClass,
  isEditorRegistry,
} from '../../model/editormodel';
import { MMELDataAttribute } from '../../serialize/interface/datainterface';
import {
  getReferenceDCTypeName,
  referenceSorter,
} from '../../utils/ModelFunctions';
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
import { CardinalityField } from './components/CardinalityEdit';

const AttributeEditPage: React.FC<{
  attributes: Record<string, MMELDataAttribute>;
  setAtts: (x: Record<string, MMELDataAttribute>) => void;
  model: EditorModel;
}> = ({ attributes, setAtts, model }) => {
  function matchFilter(x: IObject, filter: string): boolean {
    const att = x as MMELDataAttribute;
    return (
      filter === '' ||
      att.id.toLowerCase().includes(filter) ||
      att.definition.toLowerCase().includes(filter)
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
  object: Object;
  model?: EditorModel;
  setObject: (obj: Object) => void;
}> = ({ object, model, setObject }) => {
  const att = object as MMELDataAttribute;

  const types: string[] = [...DATATYPE];
  for (const x in model!.elements) {
    const elm = model!.elements[x];
    if (isEditorRegistry(elm)) {
      types.push(getReferenceDCTypeName(elm.id));
    } else if (isEditorDataClass(elm) && elm.mother === '') {
      types.push(elm.id);
    }
  }

  for (const x in model!.enums) {
    const en = model!.enums[x];
    types.push(en.id);
  }

  const refs = Object.values(model!.refs)
    .sort(referenceSorter)
    .map(r => r.id);

  return (
    <MGDDisplayPane>
      <FormGroup>
        <NormalTextField
          text="Attribute ID"
          value={att.id}
          onChange={(x: string) => {
            att.id = x.replaceAll(/\s+/g, '');
            setObject({ ...att });
          }}
        />
        <NormalTextField
          text="Attribute Definition"
          value={att.definition}
          onChange={(x: string) => {
            att.definition = x;
            setObject({ ...att });
          }}
        />
        <CardinalityField
          value={att.cardinality}
          onChange={x => {
            att.cardinality = x;
            setObject({ ...att });
          }}
        />
        <NormalComboBox
          text="Attribute Modality"
          value={att.modality}
          options={MODAILITYOPTIONS}
          onChange={x => {
            att.modality = x;
            setObject({ ...att });
          }}
        />
        <ReferenceSelector
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
      </FormGroup>
    </MGDDisplayPane>
  );
};

export default AttributeEditPage;
