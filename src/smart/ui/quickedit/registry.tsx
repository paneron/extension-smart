import { FormGroup } from '@blueprintjs/core';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  editImportRegistryCommand,
  editRegistryCommand,
} from '../../model/editor/commands/data';
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
import AttributeListQuickEdit, { findAllAttributeTypes } from '../edit/components/AttributeList';

const QuickEditRegistry: React.FC<{
  registry: EditorRegistry;
  model: EditorModel;
  act: (x: ModelAction) => void;
  provision?: RefTextSelection;
  setSelectedNode?: (id: string) => void;
  setUndoListener: (x: (() => void) | undefined) => void;
  clearRedo: () => void;
}> = props => {
  const {
    registry,
    model,
    act,
    provision,
    setSelectedNode,
    setUndoListener,
    clearRedo,
  } = props;

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
  const exitRef = useRef<{exit: ()=>void}>({exit: saveOnExit});
  exitRef.current.exit = saveOnExit;

  function onAddReference(refs: MMELReference[]) {
    setHasChange(false);
    setEditing(edit => {      
      act(editImportRegistryCommand(registry.id, edit, refs));      
      return edit;
    });
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
      clearRedo();
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
    if (hasChange) {      
      act(editRegistryCommand(registry.id, editing));
      setHasChange(false);
    }    
  }  

  useEffect(() => {    
    setEditing(regCombined)
    setUndoListener(() => setHasChange(false));
    return () => {      
      setUndoListener(undefined);
      exitRef.current.exit();
    };
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
