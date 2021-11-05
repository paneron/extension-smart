import { FormGroup } from '@blueprintjs/core';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  EditorDataClass,
  EditorModel,
  isEditorDataClass,
} from '../../model/editormodel';
import { RefTextSelection } from '../../model/selectionImport';
import { MMELDataAttribute } from '../../serialize/interface/datainterface';
import { MMELReference } from '../../serialize/interface/supportinterface';
import { fillRDCS, trydefaultID } from '../../utils/ModelFunctions';
import { DescriptionItem } from '../common/description/fields';
import { EditPageButtons } from '../edit/commons';
import AttributeListQuickEdit, {
  findAllAttributeTypes,
} from '../edit/components/AttributeList';

interface StateTracker {
  hasChange: boolean;
  model: EditorModel;
  attributes: Record<string, MMELDataAttribute>;
}

const QuickEditDataClass: React.FC<{
  dataclass: EditorDataClass;
  model: EditorModel;
  setModel: (m: EditorModel) => void;
  provision?: RefTextSelection;
}> = props => {
  const { dataclass, model, setModel, provision } = props;

  const [attributes, setAttributes] = useState<
    Record<string, MMELDataAttribute>
  >(getInitAttributes(dataclass));
  const [hasChange, setHasChange] = useState<boolean>(false);

  const types = useMemo(() => findAllAttributeTypes(model), [model]);
  const typesObj = useMemo(
    () => types.reduce((obj, x) => ({ ...obj, [x.id]: x }), {}),
    [types]
  );

  const stateRef = useRef<StateTracker>();
  stateRef.current = { hasChange, model, attributes };

  function onAddReference(refs: Record<string, MMELReference>) {
    setModel({ ...model, refs });
  }

  function onUpdateClick() {
    setModel(save(dataclass, attributes, model));
  }

  function onChange() {
    if (!hasChange) {
      setHasChange(true);
    }
  }

  function setAtt(x: Record<string, MMELDataAttribute>) {
    setAttributes(x);
    onChange();
  }

  function saveOnExit() {
    if (stateRef.current !== undefined) {
      const { hasChange, model, attributes } = stateRef.current;
      if (hasChange) {
        setModel(save(dataclass, attributes, model));
        setHasChange(false);
      }
    }
  }

  useEffect(() => {
    setAttributes(getInitAttributes(dataclass));
    return saveOnExit;
  }, [dataclass]);

  return (
    <FormGroup>
      <EditPageButtons onUpdateClick={onUpdateClick} />
      <DescriptionItem label="Dataclass ID" value={dataclass.id} />
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
  dc: EditorDataClass,
  raw: Record<string, MMELDataAttribute>,
  model: EditorModel
): EditorModel {
  const newModel = { ...model };
  const attributes = processAttributes(raw);
  dc = { ...dc, attributes };
  fillRDCS(dc, model.elements);
  newModel.elements = {
    ...model.elements,
    [dc.id]: dc,
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
  dc: EditorDataClass
): Record<string, MMELDataAttribute> {
  const atts: Record<string, MMELDataAttribute> = {};
  if (dc !== undefined && isEditorDataClass(dc)) {
    Object.values(dc.attributes).forEach((a, index) => {
      atts['a' + index.toString()] = { ...a };
    });
  }
  return atts;
}

export default QuickEditDataClass;
