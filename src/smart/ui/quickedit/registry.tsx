import { FormGroup } from '@blueprintjs/core';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  EditorDataClass,
  EditorModel,
  EditorRegistry,
  isEditorDataClass,
} from '../../model/editormodel';
import { RefTextSelection } from '../../model/selectionImport';
import { DataType } from '../../serialize/interface/baseinterface';
import { MMELDataAttribute } from '../../serialize/interface/datainterface';
import { MMELReference } from '../../serialize/interface/supportinterface';
import { fillRDCS, trydefaultID } from '../../utils/ModelFunctions';
import { DescriptionItem } from '../common/description/fields';
import { NormalTextField } from '../common/fields';
import { EditPageButtons } from '../edit/commons';
import AttributeListQuickEdit, {
  findAllAttributeTypes,
} from '../edit/components/AttributeList';

interface StateTracker {
  hasChange: boolean;
  model: EditorModel;
  editing: EditorRegistry;
  attributes: Record<string, MMELDataAttribute>;
}

const QuickEditRegistry: React.FC<{
  registry: EditorRegistry;
  model: EditorModel;
  setModel: (m: EditorModel) => void;
  provision?: RefTextSelection;
}> = props => {
  const { registry, model, setModel, provision } = props;

  const [editing, setEditing] = useState<EditorRegistry>({ ...registry });
  const [attributes, setAttributes] = useState<
    Record<string, MMELDataAttribute>
  >(getInitAttributes(model, registry));
  const [hasChange, setHasChange] = useState<boolean>(false);

  const types = useMemo(() => findAllAttributeTypes(model), [model]);
  const typesObj = useMemo(
    () => types.reduce((obj, x) => ({ ...obj, [x.id]: x }), {}),
    [types]
  );

  const stateRef = useRef<StateTracker>();
  stateRef.current = { hasChange, model, editing, attributes };

  function onAddReference(refs: Record<string, MMELReference>) {
    setModel({ ...model, refs });
  }

  function onUpdateClick() {
    setModel(save(editing, attributes, model));
  }

  function onChange() {
    if (!hasChange) {
      setHasChange(true);
    }
  }

  function setEdit(x: EditorRegistry) {
    setEditing(x);
    onChange();
  }

  function setAtt(x: Record<string, MMELDataAttribute>) {
    setAttributes(x);
    onChange();
  }

  function saveOnExit() {
    if (stateRef.current !== undefined) {
      const { hasChange, editing, model, attributes } = stateRef.current;
      if (hasChange) {
        setModel(save(editing, attributes, model));
        setHasChange(false);
      }
    }
  }

  useEffect(() => {
    setEditing(registry);
    setAttributes(getInitAttributes(model, registry));
    return saveOnExit;
  }, [registry]);

  return (
    <FormGroup>
      <EditPageButtons onUpdateClick={onUpdateClick} />
      <DescriptionItem label="Registry ID" value={editing.id} />
      <NormalTextField
        text="Registry title"
        value={editing.title}
        onChange={x => setEdit({ ...editing, title: x })}
      />
      <AttributeListQuickEdit
        attributes={attributes}
        setAttributes={setAtt}
        selected={provision}
        model={model}
        types={types}
        typesObj={typesObj}
        onAddReference={onAddReference}
      />
    </FormGroup>
  );
};

function save(
  registry: EditorRegistry,
  raw: Record<string, MMELDataAttribute>,
  model: EditorModel
): EditorModel {
  const newModel = { ...model };
  const attributes = processAttributes(raw);
  const dc: EditorDataClass = {
    attributes,
    id: registry.data,
    datatype: DataType.DATACLASS,
    added: registry.added,
    pages: registry.pages,
    objectVersion: registry.objectVersion,
    rdcs: new Set<string>(),
    mother: registry.id,
  };
  fillRDCS(dc, model.elements);
  newModel.elements = {
    ...model.elements,
    [registry.id]: registry,
    [registry.data]: dc,
  };
  return newModel;
}

function processAttributes(
  raw: Record<string, MMELDataAttribute>
): Record<string, MMELDataAttribute> {
  const attributes: Record<string, MMELDataAttribute> = {};
  for (const x of Object.values(raw)) {
    const id = trydefaultID(x.id, attributes);
    attributes[id] = { ...x, id };
  }
  return attributes;
}

function getInitAttributes(
  model: EditorModel,
  registry: EditorRegistry
): Record<string, MMELDataAttribute> {
  const atts: Record<string, MMELDataAttribute> = {};
  const dc = model.elements[registry.data];
  if (dc !== undefined && isEditorDataClass(dc)) {
    Object.values(dc.attributes).forEach((a, index) => {
      atts['a' + index.toString()] = { ...a };
    });
  }
  return atts;
}

export default QuickEditRegistry;
