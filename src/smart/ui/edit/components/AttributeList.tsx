import { Button, FormGroup } from '@blueprintjs/core';
import React from 'react';
import { useMemo } from 'react';
import {
  EditorModel,
  isEditorDataClass,
  isEditorRegistry,
} from '../../../model/editormodel';
import { RefTextSelection } from '../../../model/selectionImport';
import { DataType } from '../../../serialize/interface/baseinterface';
import { MMELDataAttribute } from '../../../serialize/interface/datainterface';
import { MMELReference } from '../../../serialize/interface/supportinterface';
import { DATATYPE, MODAILITYOPTIONS } from '../../../utils/constants';
import { createDataAttribute } from '../../../utils/EditorFactory';
import {
  findUniqueID,
  getModelAllRefs,
  getReferenceDCTypeName,
  trydefaultID,
} from '../../../utils/ModelFunctions';
import { findExistingRef } from '../../../utils/ModelImport';
import { NormalComboBox, NormalTextField } from '../../common/fields';
import DataTypeSelector from './DataTypeSelector';
import SimpleReferenceSelector from './ReferenceSelector';

export interface AttributeType {
  id: string;
  name: string;
  display: string;
}

export function findAllAttributeTypes(model: EditorModel): AttributeType[] {
  const types: AttributeType[] = DATATYPE.map(x => ({
    id: x,
    name: x !== '' ? x : 'Not specified',
    display: x !== '' ? `Primitive type: ${x}` : 'Not specified',
  }));
  for (const x in model.elements) {
    const elm = model.elements[x];
    if (isEditorRegistry(elm)) {
      types.push({
        id: getReferenceDCTypeName(elm.id),
        name: elm.title,
        display: `Reference to ${elm.title}`,
      });
    } else if (isEditorDataClass(elm) && elm.mother === '') {
      types.push({
        id: elm.id,
        name: elm.id,
        display: `Custom structure: ${elm.id}`,
      });
    }
  }
  for (const x in model.enums) {
    const en = model.enums[x];
    types.push({ id: en.id, name: en.id, display: `Enum: ${en.id}` });
  }
  return types;
}

const AttributeListQuickEdit: React.FC<{
  attributes: Record<string, MMELDataAttribute>;
  setAttributes: (x: Record<string, MMELDataAttribute>) => void;
  model: EditorModel;
  selected?: RefTextSelection;
  onAddReference: (refs: Record<string, MMELReference>) => void;
  types: AttributeType[];
  typesObj: Record<string, AttributeType>;
}> = function ({
  attributes,
  setAttributes,
  model,
  selected,
  onAddReference,
  types,
  typesObj,
}) {
  const refs = useMemo(() => getModelAllRefs(model), [model]);

  function addAttribute() {
    const id = findUniqueID('att', attributes);
    setAttributes({ ...attributes, [id]: createDataAttribute(id) });
  }

  function onImport() {
    if (selected !== undefined) {
      const ref: MMELReference = {
        id: '',
        title: selected.clauseTitle,
        clause: selected.clause,
        document: selected.doc,
        datatype: DataType.REFERENCE,
      };
      const existing = findExistingRef(model, ref, false);
      const refid =
        existing !== null
          ? existing.id
          : trydefaultID(
              `${selected.namespace}-ref${selected.clause.replaceAll(
                '.',
                '-'
              )}`,
              model.refs
            );
      if (existing === null) {
        onAddReference({ ...model.refs, [refid]: { ...ref, id: refid } });
      }

      const id = findUniqueID('attribute', attributes);
      const newAtt: MMELDataAttribute = {
        id,
        modality: '',
        type: '',
        cardinality: '',
        definition: selected.text,
        ref: new Set<string>([refid]),
        datatype: DataType.DATAATTRIBUTE,
      };
      setAttributes({ ...attributes, [id]: newAtt });
    }
  }

  return (
    <FormGroup label="Attributes">
      {selected !== undefined && (
        <div
          style={{
            width: '100%',
            marginBottom: '15px',
            textAlign: 'center',
          }}
        >
          <Button intent="primary" onClick={onImport}>
            Import from selection
          </Button>
        </div>
      )}

      {Object.entries(attributes).map(([index, a]) => (
        <AttributeQuickEdit
          key={index}
          attribute={a}
          refs={refs}
          setAttribute={x => {
            setAttributes({ ...attributes, [index]: x });
          }}
          onDelete={() => {
            const newAttributes = { ...attributes };
            delete newAttributes[index];
            setAttributes(newAttributes);
          }}
          types={types}
          typesObj={typesObj}
        />
      ))}
      <Button icon="plus" onClick={addAttribute}>
        Add attribute
      </Button>
    </FormGroup>
  );
};

const AttributeQuickEdit: React.FC<{
  attribute: MMELDataAttribute;
  setAttribute: (x: MMELDataAttribute) => void;
  refs: MMELReference[];
  onDelete: () => void;
  types: AttributeType[];
  typesObj: Record<string, AttributeType>;
}> = function ({ attribute, setAttribute, refs, onDelete, types, typesObj }) {
  return (
    <div
      style={{
        position: 'relative',
      }}
    >
      <fieldset>
        <NormalTextField
          text="Definition"
          value={attribute.definition}
          onChange={x => setAttribute({ ...attribute, definition: x })}
        />
        <NormalComboBox
          text="Attribute Modality"
          value={attribute.modality}
          options={MODAILITYOPTIONS}
          onChange={x => setAttribute({ ...attribute, modality: x })}
        />
        <DataTypeSelector
          label="Data Type"
          activeItem={typesObj[attribute.type] ?? null}
          items={types}
          onItemSelect={x =>
            setAttribute({ ...attribute, type: x !== null ? x.id : '' })
          }
        />
        <SimpleReferenceSelector
          selected={attribute.ref}
          items={refs}
          onItemSelect={x =>
            setAttribute({
              ...attribute,
              ref: new Set([...attribute.ref, x.id]),
            })
          }
          onTagRemove={x => {
            attribute.ref = new Set([...attribute.ref].filter(s => x !== s));
            setAttribute({ ...attribute });
          }}
        />
        <div
          style={{
            position: 'absolute',
            right: 0,
            top: -8,
            zIndex: 10,
          }}
        >
          <Button intent="danger" onClick={onDelete}>
            Delete
          </Button>
        </div>
      </fieldset>
    </div>
  );
};

export default AttributeListQuickEdit;
