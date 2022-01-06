import { FormGroup } from '@blueprintjs/core';
import React, { useEffect, useMemo, useState } from 'react';
import { editDCCommand } from '../../model/editor/commands/data';
import { ModelAction } from '../../model/editor/model';
import { EditorDataClass, EditorModel } from '../../model/editormodel';
import { RefTextSelection } from '../../model/selectionImport';
import { MMELDataAttribute } from '../../serialize/interface/datainterface';
import { MMELReference } from '../../serialize/interface/supportinterface';
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
}> = props => {
  const { dataclass, model, act, provision, setSelectedNode } = props;

  const [editing, setEditing] = useState<EditorDataClass>(dataclass);
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
    act(editDCCommand(dataclass.id, editing));
    setHasChange(false);
    if (setSelectedNode && dataclass.id !== editing.id) {
      setSelectedNode(editing.id);
    }
  }

  function onChange() {
    if (!hasChange) {
      setHasChange(true);
    }
  }

  function setAtt(x: Record<string, MMELDataAttribute>) {
    setEditing({ ...editing, attributes: x });
    onChange();
  }

  function saveOnExit() {
    setHasChange(hc => {
      if (hc) {
        setEditing(edit => {
          act(editDCCommand(dataclass.id, edit));
          return edit;
        });
      }
      return false;
    });
  }

  useEffect(() => {
    setEditing(dataclass);
    return saveOnExit;
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
