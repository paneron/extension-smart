import { FormGroup } from '@blueprintjs/core';
import React, { useEffect, useState } from 'react';
import MGDDisplayPane from '../../MGDComponents/MGDDisplayPane';
import { editElmCommand } from '../../model/editor/commands/elements';
import { ModelAction } from '../../model/editor/model';
import { EditorModel, EditorSignalEvent } from '../../model/editormodel';
import {
  checkId,
  getModelAllSignals,
  removeSpace,
} from '../../utils/ModelFunctions';
import { DescriptionItem } from '../common/description/fields';
import { NormalTextField, ReferenceSelector } from '../common/fields';
import PopoverChangeIDButton from '../popover/PopoverChangeIDButton';
import { EditPageButtons } from './commons';

interface CommonSignalEditProps {
  onUpdateClick: () => void;
  editing: EditorSignalEvent;
  setEditing: (x: EditorSignalEvent) => void;
  onFullEditClick?: () => void;
  onDeleteClick?: () => void;
  setUndoListener: (x: (() => void) | undefined) => void;
}

const EditSignalEventPage: React.FC<{
  model: EditorModel;
  act: (x: ModelAction) => void;
  event: EditorSignalEvent;
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
  event,
  closeDialog,
  minimal,
  onFullEditClick,
  onDeleteClick,
  setSelectedNode,
  setUndoListener,
  clearRedo,
}) {
  const signals = getModelAllSignals(model);

  const [editing, setEditing] = useState<EditorSignalEvent>({ ...event });
  const [hasChange, setHasChange] = useState<boolean>(false);

  function onUpdateClick() {
    act(editElmCommand(event.id, editing));
    if (closeDialog) {
      closeDialog();
    }
    setHasChange(false);
    if (setSelectedNode !== undefined && event.id !== editing.id) {
      setSelectedNode(editing.id);
    }
  }

  function setEdit(x: EditorSignalEvent) {
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
          act(editElmCommand(event.id, edit));
          return edit;
        });
      }
      return false;
    });
  }

  function onNewID(id: string) {
    act(editElmCommand(event.id, { ...editing, id }));
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

  const commonProps: CommonSignalEditProps = {
    onUpdateClick,
    editing,
    setEditing,
    onDeleteClick,
    onFullEditClick: fullEditClick,
    setUndoListener,
  };

  const fullEditProps = { closeDialog, signals };

  const quickEditProps = {
    saveOnExit,
    scEvent: event,
    setEditing: setEdit,
    initID: event.id,
    validTest: (id: string) => id === event.id || checkId(id, model.elements),
    onNewID,
    model,
    setHasChange,
  };

  useEffect(() => setEditing(event), [event]);

  return minimal ? (
    <QuickVersionEdit {...commonProps} {...quickEditProps} />
  ) : (
    <FullVersionEdit {...commonProps} {...fullEditProps} />
  );
};

const QuickVersionEdit: React.FC<
  CommonSignalEditProps & {
    saveOnExit: () => void;
    scEvent: EditorSignalEvent;
    model: EditorModel;
    onNewID: (id: string) => void;
    setUndoListener: (x: (() => void) | undefined) => void;
    setHasChange: (x: boolean) => void;
  }
> = function (props) {
  const {
    model,
    editing,
    setEditing,
    scEvent,
    saveOnExit,
    onNewID,
    setUndoListener,
    setHasChange,
  } = props;

  function idTest(id: string) {
    return id === scEvent.id || checkId(id, model.elements);
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
  }, [scEvent]);

  return (
    <FormGroup>
      <EditPageButtons {...props} />
      <DescriptionItem
        label="Signal Catch Event ID"
        value={editing.id}
        extend={idButton}
      />
      <NormalTextField
        text="Signal"
        value={editing.signal}
        onChange={x => setEditing({ ...editing, signal: x })}
      />
    </FormGroup>
  );
};

const FullVersionEdit: React.FC<
  CommonSignalEditProps & {
    closeDialog?: () => void;
    signals: string[];
    setUndoListener: (x: (() => void) | undefined) => void;
  }
> = function (props) {
  const { editing, setEditing, signals, closeDialog, setUndoListener } = props;

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
          text="Signal Catch Event ID"
          value={editing.id}
          onChange={x => setEditing({ ...editing, id: removeSpace(x) })}
        />
        <ReferenceSelector
          text="Signal"
          filterName="Signal filter"
          value={editing.signal}
          options={signals}
          update={x => setEditing({ ...editing, signal: signals[x] })}
          editable={true}
          onChange={x => setEditing({ ...editing, signal: x })}
        />
      </FormGroup>
    </MGDDisplayPane>
  );
};

export default EditSignalEventPage;
