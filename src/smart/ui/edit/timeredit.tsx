import { FormGroup } from '@blueprintjs/core';
import React, { useEffect, useState } from 'react';
import MGDDisplayPane from '../../MGDComponents/MGDDisplayPane';
import { EditorModel, EditorTimerEvent } from '../../model/editormodel';
import { checkId, removeSpace } from '../../utils/ModelFunctions';
import { TimerType } from '../../utils/constants';
import { NormalComboBox, NormalTextField } from '../common/fields';
import { EditPageButtons } from './commons';
import { DescriptionItem } from '../common/description/fields';
import { ModelAction } from '../../model/editor/model';
import PopoverChangeIDButton from '../popover/PopoverChangeIDButton';
import { editElmCommand } from '../../model/editor/commands/elements';

interface CommonTimerEditProps {
  onUpdateClick: () => void;
  editing: EditorTimerEvent;
  setEditing: (x: EditorTimerEvent) => void;
  onFullEditClick?: () => void;
  onDeleteClick?: () => void;
  model: EditorModel;
}

const EditTimerPage: React.FC<{
  model: EditorModel;
  act: (x: ModelAction) => void;
  timer: EditorTimerEvent;
  closeDialog?: () => void;
  minimal?: boolean;
  onFullEditClick?: () => void;
  onDeleteClick?: () => void;
  setSelectedNode?: (id: string) => void;
}> = function ({
  model,
  act,
  timer,
  minimal,
  closeDialog,
  onDeleteClick,
  onFullEditClick,
  setSelectedNode,
}) {
  const [editing, setEditing] = useState<EditorTimerEvent>({ ...timer });
  const [hasChange, setHasChange] = useState<boolean>(false);

  function onUpdateClick() {
    act(editElmCommand(timer.id, editing));
    if (closeDialog) {
      closeDialog();
    }
    setHasChange(false);
    if (setSelectedNode !== undefined && timer.id !== editing.id) {
      setSelectedNode(editing.id);
    }
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
          act(editElmCommand(timer.id, edit));
          return edit;
        });
      }
      return false;
    });
  }

  function onNewID(id: string) {
    act(editElmCommand(timer.id, { ...editing, id }));
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
    model,
  };

  const fullEditProps = { closeDialog };

  const quickEditProps = {
    saveOnExit,
    timer,
    setEditing: setEdit,
    initID: timer.id,
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
    onNewID: (id: string) => void;
  }
> = function (props) {
  const { editing, setEditing, model, timer, saveOnExit, onNewID } = props;

  useEffect(() => saveOnExit, [timer]);

  function idTest(id: string) {
    return id === timer.id || checkId(id, model.elements);
  }

  const idButton = (
    <PopoverChangeIDButton
      initValue={editing.id}
      validTest={idTest}
      save={onNewID}
    />
  );

  return (
    <FormGroup>
      <EditPageButtons {...props} />
      <DescriptionItem label="Timer ID" value={editing.id} extend={idButton} />
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

export default EditTimerPage;
