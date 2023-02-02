import { FormGroup } from '@blueprintjs/core';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  editDCCommand,
  editImportDCCommand,
} from '../../model/editor/commands/data';
import { ModelAction } from '../../model/editor/model';
import { EditorDataClass, EditorModel } from '../../model/editormodel';
import { RefTextSelection } from '../../model/selectionImport';
import { MMELDataAttribute } from '@paneron/libmmel/interface/datainterface';
import { MMELReference } from '@paneron/libmmel/interface/supportinterface';
import { DescriptionItem } from '../common/description/fields';
import { EditPageButtons } from '../edit/commons';
import AttributeListQuickEdit, {
  findAllAttributeTypes,
} from '../edit/components/AttributeList';

const QuickEditDataClass: React.FC<{
  dataclass: EditorDataClass;
  model: EditorModel;
  act: (x: ModelAction) => void;
  provision?: RefTextSelection;
  setSelectedNode?: (id: string) => void;
  setUndoListener: (x: (() => void) | undefined) => void;
  clearRedo: () => void;
}> = props => {
  const {
    dataclass,
    model,
    act,
    provision,
    setSelectedNode,
    setUndoListener,
    clearRedo,
  } = props;

  const [editing, setEditing] = useState<EditorDataClass>(dataclass);
  const [hasChange, setHasChange] = useState<boolean>(false);
  const exitRef = useRef<{ exit: () => void }>({ exit : saveOnExit });
  exitRef.current.exit = saveOnExit;

  const types = useMemo(() => findAllAttributeTypes(model), [model]);
  const typesObj = useMemo(
    () => types.reduce((obj, x) => ({ ...obj, [x.id] : x }), {}),
    [types]
  );

  function onAddReference(refs: MMELReference[]) {
    setHasChange(false);
    setEditing(edit => {
      act(editImportDCCommand(dataclass.id, edit, refs));
      return edit;
    });
  }

  function onUpdateClick() {
    act(editDCCommand(dataclass.id, editing));
    setHasChange(false);
    if (setSelectedNode && dataclass.id !== editing.id) {
      setSelectedNode(editing.id);
    }
  }

  function onChange() {
    if (!hasChange) {
      clearRedo();
      setHasChange(true);
    }
  }

  function setAtt(x: Record<string, MMELDataAttribute>) {
    setEditing({ ...editing, attributes : x });
    onChange();
  }

  function saveOnExit() {
    if (hasChange) {
      act(editDCCommand(dataclass.id, editing));
      setHasChange(false);
    }
  }

  useEffect(() => {
    setEditing(dataclass);
    setUndoListener(() => setHasChange(false));
    return () => {
      setUndoListener(undefined);
      exitRef.current.exit();
    };
  }, [dataclass]);

  return (
    <FormGroup>
      <EditPageButtons onUpdateClick={onUpdateClick} />
      <DescriptionItem label="Dataclass ID" value={dataclass.id} />
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

export default QuickEditDataClass;
