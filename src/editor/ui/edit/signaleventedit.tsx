/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { jsx } from '@emotion/react';
import React, { useState } from 'react';
import { useStoreActions } from 'react-flow-renderer';
import { EditorModel, EditorSignalEvent } from '../../model/editormodel';
import { ModelWrapper } from '../../model/modelwrapper';
import { checkId, getModelAllSignals, removeSpace, updatePageElement } from '../../utils/commonfunctions';
import { NormalTextField, ReferenceSelector } from '../common/fields';
import { EditPageButtons } from './commons';

const EditSignalEventPage: React.FC<{
  modelwrapper: ModelWrapper;
  setModel: (m: EditorModel) => void;
  id: string;
  closeDialog: () => void;
}> = function ({ modelwrapper, setModel, id, closeDialog }) {
  const setElm = useStoreActions(act => act.setSelectedElements);

  const model = modelwrapper.model;
  const scEvent = model.elements[id] as EditorSignalEvent;

  const signals = getModelAllSignals(model);

  const [editing, setEditing] = useState<EditorSignalEvent>({ ...scEvent });

  function onUpdateClick() {
    const updated = save(
      id,
      editing,
      modelwrapper.page,
      model
    );
    if (updated !== null) {
      setElm([]);
      setModel({ ...updated });
      closeDialog();
    }
  }

  return (
    <>
      <EditPageButtons
        onUpdateClick={onUpdateClick}
        onCancelClick={closeDialog}
      />
      <NormalTextField
        key="field#scEventID"
        text="Signal Catch Event ID"
        value={editing.id}
        onChange={x => setEditing({ ...editing, id: removeSpace(x) })}
      />      
      <ReferenceSelector
        key="field#scEventSignal"
        text="Signal"
        filterName="Signal filter"
        value={editing.signal}
        options={signals}
        update={x => setEditing({ ...editing, signal: signals[x] }) }
        editable={true}
        onChange={x => setEditing({ ...editing, signal: x })}
      />
    </>
  );
};

function save(
  oldId: string,
  scEvent: EditorSignalEvent,
  pageid: string,
  model: EditorModel
): EditorModel | null {
  const page = model.pages[pageid];
  if (oldId !== scEvent.id) {
    if (checkId(scEvent.id, model.elements)) {
      delete model.elements[oldId];
      updatePageElement(page, oldId, scEvent);
      model.elements[scEvent.id] = scEvent;
    } else {
      return null;
    }
  } else {
    model.elements[oldId] = scEvent;
  }
  return model;
}

export default EditSignalEventPage;
