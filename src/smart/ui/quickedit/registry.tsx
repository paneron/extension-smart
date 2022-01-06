import { FormGroup } from '@blueprintjs/core';
import React, { useEffect, useMemo, useState } from 'react';
import { editRegistryCommand } from '../../model/editor/commands/data';
import { RegistryCombined } from '../../model/editor/components/element/registry';
import { ModelAction } from '../../model/editor/model';
import {
  EditorDataClass,
  EditorModel,
  EditorRegistry,
} from '../../model/editormodel';
import { RefTextSelection } from '../../model/selectionImport';
import { MMELDataAttribute } from '../../serialize/interface/datainterface';
import { MMELReference } from '../../serialize/interface/supportinterface';
import { DescriptionItem } from '../common/description/fields';
import { NormalTextField } from '../common/fields';
import { EditPageButtons } from '../edit/commons';
import AttributeListQuickEdit, {
  findAllAttributeTypes,
} from '../edit/components/AttributeList';

const QuickEditRegistry: React.FC<{
  registry: EditorRegistry;
  model: EditorModel;
  act: (x: ModelAction) => void;
  provision?: RefTextSelection;
  setSelectedNode?: (id: string) => void;
}> = props => {
  const { registry, model, act, provision, setSelectedNode } = props;

  const dc = model.elements[registry.data] as EditorDataClass;
  const regCombined: RegistryCombined = {
    ...dc,
    id: registry.id,
    title: registry.title,
    rdcs: new Set(dc.rdcs),
  };

  const [editing, setEditing] = useState<RegistryCombined>(regCombined);
  const [hasChange, setHasChange] = useState<boolean>(false);

  const types = useMemo(() => findAllAttributeTypes(model), [model]);
  const typesObj = useMemo(
    () => types.reduce((obj, x) => ({ ...obj, [x.id]: x }), {}),
    [types]
  );

  function onAddReference(refs: Record<string, MMELReference>) {
    throw new Error('Not yet migrated');
  }

  function onUpdateClick() {
    act(editRegistryCommand(registry.id, editing));
    setHasChange(false);
    if (setSelectedNode && registry.id !== editing.id) {
      setSelectedNode(editing.id);
    }
  }

  function onChange() {
    if (!hasChange) {
      setHasChange(true);
    }
  }

  function setEdit(x: RegistryCombined) {
    setEditing(x);
    onChange();
  }

  function setAtt(x: Record<string, MMELDataAttribute>) {
    setEditing({ ...editing, attributes: { ...x } });
    onChange();
  }

  function saveOnExit() {
    setHasChange(hc => {
      if (hc) {
        setEditing(edit => {
          act(editRegistryCommand(registry.id, edit));
          return edit;
        });
      }
      return false;
    });
  }

  useEffect(() => {
    setEditing(regCombined);
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
        attributes={editing.attributes}
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

export default QuickEditRegistry;
