import { FormGroup } from '@blueprintjs/core';
import React from 'react';
import MGDDisplayPane from '@/smart/MGDComponents/MGDDisplayPane';
import type {
  EditorModel } from '@/smart/model/editormodel';
import {
  isEditorDataClass,
  isEditorRegistry,
} from '@/smart/model/editormodel';
import type { MMELDataAttribute } from '@paneron/libmmel/interface/datainterface';
import {
  getReferenceDCTypeName,
  referenceSorter,
} from '@/smart/utils/ModelFunctions';
import { DATATYPE, MODAILITYOPTIONS } from '@/smart/utils/constants';
import { createDataAttribute } from '@/smart/utils/EditorFactory';
import {
  MultiReferenceSelector,
  NormalComboBox,
  NormalTextField,
  ReferenceSelector,
} from '@/smart/ui/common/fields';
import ListWithPopoverItem from '@/smart/ui/common/listmanagement/listPopoverItem';
import { CardinalityField } from '@/smart/ui/edit/components/CardinalityEdit';

const AttributeEditPage: React.FC<{
  attributes: Record<string, MMELDataAttribute>;
  setAtts: (x: Record<string, MMELDataAttribute>) => void;
  model: EditorModel;
  oldid?: string;
}> = ({ attributes, setAtts, model, oldid }) => {
  function matchFilter(att: MMELDataAttribute, filter: string): boolean {
    return (
      filter === '' ||
      att.id.toLowerCase().includes(filter) ||
      att.definition.toLowerCase().includes(filter)
    );
  }

  const AttributeItem: React.FC<{
    object: MMELDataAttribute;
    model?: EditorModel;
    setObject: (obj: MMELDataAttribute) => void;
  }> = ({ object: att, model, setObject: setAtt }) => {
    const types: string[] = [...DATATYPE];
    for (const x in model!.elements) {
      const elm = model!.elements[x];
      if (isEditorRegistry(elm)) {
        types.push(getReferenceDCTypeName(elm.id));
      } else if (
        isEditorDataClass(elm) &&
        elm.mother === '' &&
        elm.id !== oldid
      ) {
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
              setAtt({ ...att });
            }}
          />
          <NormalTextField
            text="Attribute Definition"
            value={att.definition}
            onChange={(x: string) => {
              att.definition = x;
              setAtt({ ...att });
            }}
          />
          <CardinalityField
            value={att.cardinality}
            onChange={x => {
              att.cardinality = x;
              setAtt({ ...att });
            }}
          />
          <NormalComboBox
            text="Attribute Modality"
            value={att.modality}
            options={MODAILITYOPTIONS}
            onChange={x => {
              att.modality = x;
              setAtt({ ...att });
            }}
          />
          <ReferenceSelector
            text="Attribute Type"
            filterName="Type filter"
            value={att.type}
            options={types}
            update={(x: number) => {
              att.type = types[x];
              setAtt({ ...att });
            }}
          />
          <MultiReferenceSelector
            text="Reference"
            options={refs}
            values={att.ref}
            filterName="Reference filter"
            add={x => {
              att.ref = new Set([...att.ref, ...x]);
              setAtt({ ...att });
            }}
            remove={x => {
              att.ref = new Set([...att.ref].filter(s => !x.has(s)));
              setAtt({ ...att });
            }}
          />
        </FormGroup>
      </MGDDisplayPane>
    );
  };

  return (
    <ListWithPopoverItem
      items={attributes}
      setItems={x => setAtts(x)}
      model={model}
      initObject={createDataAttribute('')}
      matchFilter={matchFilter}
      filterName="Attribute filter"
      Content={AttributeItem}
      label="Attributes"
    />
  );
};

export default AttributeEditPage;
