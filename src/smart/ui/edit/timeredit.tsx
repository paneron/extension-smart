import { FormGroup } from '@blueprintjs/core';
import React, { useEffect, useState } from 'react';
import MGDDisplayPane from '../../MGDComponents/MGDDisplayPane';
import { EditorModel, EditorTimerEvent } from '../../model/editormodel';
import { ModelWrapper } from '../../model/modelwrapper';
import {
  checkId,
  removeSpace,
  updatePageElement,
} from '../../utils/ModelFunctions';
import { TimerType } from '../../utils/constants';
import { NormalComboBox, NormalTextField } from '../common/fields';
import { EditPageButtons } from './commons';
import { DescriptionItem } from '../common/description/fields';

interface CommonTimerEditProps {
  onUpdateClick: () => void;
  editing: EditorTimerEvent;
  setEditing: (x: EditorTimerEvent) => void;
  onFullEditClick?: () => void;
  onDeleteClick?: () => void;
}

const EditTimerPage: React.FC<{
  modelWrapper: ModelWrapper;
  setModel: (m: EditorModel) => void;
  id: string;
  closeDialog?: () => void;
  minimal?: boolean;
  onFullEditClick?: () => void;
  onDeleteClick?: () => void;
  setSelectedNode?: (id: string) => void;
}> = function ({
  modelWrapper,
  setModel,
  id,
  minimal,
  closeDialog,
  onDeleteClick,
  onFullEditClick,
  setSelectedNode,
}) {
  const model = modelWrapper.model;
  const timer = model.elements[id] as EditorTimerEvent;

  const [editing, setEditing] = useState<EditorTimerEvent>({ ...timer });
  const [hasChange, setHasChange] = useState<boolean>(false);

  function onUpdateClick() {
    const updated = save(id, editing, modelWrapper.page, model);
    if (updated !== null) {
      setModel({ ...updated });
      if (closeDialog !== undefined) {
        closeDialog();
      }
    }
    setHasChange(false);
  }

  function setEdit(x: EditorTimerEvent) {
    setEditing(x);
    onChange();
  }

  function onChange() {
    if (!hasChange) {
      setHasChange(true);
    }
  }

  function saveOnExit() {
    setHasChange(hc => {
      if (hc) {
        setEditing(edit => {
          const updated = save(id, edit, modelWrapper.page, model);
          if (updated !== null) {
            setModel({ ...updated });
          }
          return edit;
        });
      }
      return false;
    });
  }

  function onNewID(id: string) {
    const oldid = timer.id;
    const mw = modelWrapper;
    const updated = save(
      oldid,
      { ...editing, id },
      modelWrapper.page,
      mw.model
    );
    if (updated !== null) {
      setModel({ ...updated });
    }
    setHasChange(false);
    if (setSelectedNode !== undefined) {
      setSelectedNode(id);
    }
  }

  const fullEditClick =
    onFullEditClick !== undefined
      ? function () {
          if (hasChange) {
            onUpdateClick();
          }
          onFullEditClick();
        }
      : undefined;

  const commonProps: CommonTimerEditProps = {
    onUpdateClick,
    editing,
    setEditing,
    onDeleteClick,
    onFullEditClick: fullEditClick,
  };

  const fullEditProps = { closeDialog };

  const quickEditProps = {
    saveOnExit,
    timer,
    setEditing: setEdit,
    initID: timer.id,
    validTest: (id: string) => id === timer.id || checkId(id, model.elements),
    onNewID,
  };

  useEffect(() => setEditing(timer), [timer]);

  return minimal ? (
    <QuickVersionEdit {...commonProps} {...quickEditProps} />
  ) : (
    <FullVersionEdit {...commonProps} {...fullEditProps} />
  );
};

const QuickVersionEdit: React.FC<
  CommonTimerEditProps & {
    timer: EditorTimerEvent;
    saveOnExit: () => void;
  }
> = function (props) {
  const { editing, setEditing, timer, saveOnExit } = props;

  useEffect(() => saveOnExit, [timer]);

  return (
    <FormGroup>
      <EditPageButtons {...props} />
      <DescriptionItem label="Timer ID" value={editing.id} />
      <NormalComboBox
        text="Timer Type"
        value={editing.type}
        options={TimerType}
        onChange={x => setEditing({ ...editing, type: x })}
      />
      <NormalTextField
        text="Timer parameter"
        value={editing.para}
        onChange={x => setEditing({ ...editing, para: x })}
      />
    </FormGroup>
  );
};

const FullVersionEdit: React.FC<
  CommonTimerEditProps & {
    closeDialog?: () => void;
  }
> = function (props) {
  const { editing, setEditing } = props;
  return (
    <MGDDisplayPane>
      <FormGroup>
        <EditPageButtons {...props} />
        <NormalTextField
          text="Timer ID"
          value={editing.id}
          onChange={x => setEditing({ ...editing, id: removeSpace(x) })}
        />
        <NormalComboBox
          text="Timer Type"
          value={editing.type}
          options={TimerType}
          onChange={x => setEditing({ ...editing, type: x })}
        />
        <NormalTextField
          text="Timer parameter"
          value={editing.para}
          onChange={x => setEditing({ ...editing, para: x })}
        />
      </FormGroup>
    </MGDDisplayPane>
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
