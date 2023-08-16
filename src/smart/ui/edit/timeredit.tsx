import { FormGroup } from '@blueprintjs/core';
import React, { useEffect, useState } from 'react';
import MGDDisplayPane from '@/smart/MGDComponents/MGDDisplayPane';
import { EditorModel, EditorTimerEvent } from '@/smart/model/editormodel';
import { checkId, removeSpace } from '@/smart/utils/ModelFunctions';
import { TimerType } from '@/smart/utils/constants';
import { NormalComboBox, NormalTextField } from '@/smart/ui/common/fields';
import { EditPageButtons } from '@/smart/ui/edit/commons';
import { DescriptionItem } from '@/smart/ui/common/description/fields';
import { ModelAction } from '@/smart/model/editor/model';
import PopoverChangeIDButton from '@/smart/ui/popover/PopoverChangeIDButton';
import { editElmCommand } from '@/smart/model/editor/commands/elements';

interface CommonTimerEditProps {
  onUpdateClick: () => void;
  editing: EditorTimerEvent;
  setEditing: (x: EditorTimerEvent) => void;
  onFullEditClick?: () => void;
  onDeleteClick?: () => void;
  model: EditorModel;
  setUndoListener: (x: (() => void) | undefined) => void;
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
  setUndoListener: (x: (() => void) | undefined) => void;
  clearRedo: () => void;
}> = function ({
  model,
  act,
  timer,
  minimal,
  closeDialog,
  onDeleteClick,
  onFullEditClick,
  setSelectedNode,
  setUndoListener,
  clearRedo,
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
      clearRedo();
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
    onFullEditClick : fullEditClick,
    model,
    setUndoListener,
  };

  const fullEditProps = { closeDialog };

  const quickEditProps = {
    saveOnExit,
    timer,
    setEditing : setEdit,
    initID     : timer.id,
    onNewID,
    setHasChange,
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
    setUndoListener: (x: (() => void) | undefined) => void;
    setHasChange: (x: boolean) => void;
  }
> = function (props) {
  const {
    editing,
    setEditing,
    model,
    timer,
    saveOnExit,
    onNewID,
    setUndoListener,
    setHasChange,
  } = props;

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

  useEffect(() => {
    setUndoListener(() => setHasChange(false));
    return () => {
      setUndoListener(undefined);
      saveOnExit();
    };
  }, [timer]);

  return (
    <FormGroup>
      <EditPageButtons {...props} />
      <DescriptionItem label="Timer ID" value={editing.id} extend={idButton} />
      <NormalComboBox
        text="Timer Type"
        value={editing.type}
        options={TimerType}
        onChange={x => setEditing({ ...editing, type : x })}
      />
      <NormalTextField
        text="Timer parameter"
        value={editing.para}
        onChange={x => setEditing({ ...editing, para : x })}
      />
    </FormGroup>
  );
};

const FullVersionEdit: React.FC<
  CommonTimerEditProps & {
    closeDialog?: () => void;
    setUndoListener: (x: (() => void) | undefined) => void;
  }
> = function (props) {
  const { editing, setEditing, setUndoListener, closeDialog } = props;

  useEffect(() => {
    setUndoListener(() => closeDialog && closeDialog());
    return () => {
      setUndoListener(undefined);
    };
  }, []);

  return (
    <MGDDisplayPane>
      <FormGroup>
        <EditPageButtons {...props} />
        <NormalTextField
          text="Timer ID"
          value={editing.id}
          onChange={x => setEditing({ ...editing, id : removeSpace(x) })}
        />
        <NormalComboBox
          text="Timer Type"
          value={editing.type}
          options={TimerType}
          onChange={x => setEditing({ ...editing, type : x })}
        />
        <NormalTextField
          text="Timer parameter"
          value={editing.para}
          onChange={x => setEditing({ ...editing, para : x })}
        />
      </FormGroup>
    </MGDDisplayPane>
  );
};

export default EditTimerPage;
