/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { FormGroup } from '@blueprintjs/core';
import { jsx } from '@emotion/react';
import React, { useState } from 'react';
import { EditorModel, EditorTimerEvent } from '../../model/editormodel';
import { ModelWrapper } from '../../model/modelwrapper';
import {
  checkId,
  removeSpace,
  updatePageElement,
} from '../../utils/commonfunctions';
import { TimerType } from '../../utils/constants';
import { NormalComboBox, NormalTextField } from '../common/fields';
import { EditPageButtons } from './commons';

const EditTimerPage: React.FC<{
  modelwrapper: ModelWrapper;
  setModel: (m: EditorModel) => void;
  id: string;
  closeDialog: () => void;
}> = function ({ modelwrapper, setModel, id, closeDialog }) {
  const model = modelwrapper.model;
  const timer = model.elements[id] as EditorTimerEvent;

  const [editing, setEditing] = useState<EditorTimerEvent>({ ...timer });

  function onUpdateClick() {
    const updated = save(id, editing, modelwrapper.page, model);
    if (updated !== null) {
      setModel({ ...updated });
      closeDialog();
    }
  }

  return (
    <FormGroup>
      <EditPageButtons
        onUpdateClick={onUpdateClick}
        onCancelClick={closeDialog}
      />
      <NormalTextField
        key="field#timerID"
        text="Timer ID"
        value={editing.id}
        onChange={x => setEditing({ ...editing, id: removeSpace(x) })}
      />
      <NormalComboBox
        key="field#timerType"
        text="Timer Type"
        value={editing.type}
        options={TimerType}
        onChange={x => setEditing({ ...editing, type: x })}
      />
      <NormalTextField
        key="field#timerPara"
        text="Timer parameter"
        value={editing.para}
        onChange={x => setEditing({ ...editing, para: x })}
      />
    </FormGroup>
  );
};

function save(
  oldId: string,
  timer: EditorTimerEvent,
  pageid: string,
  model: EditorModel
): EditorModel | null {
  const page = model.pages[pageid];
  if (oldId !== timer.id) {
    if (checkId(timer.id, model.elements)) {
      delete model.elements[oldId];
      updatePageElement(page, oldId, timer);
      model.elements[timer.id] = timer;
    } else {
      return null;
    }
  } else {
    model.elements[oldId] = timer;
  }
  return model;
}

export default EditTimerPage;
