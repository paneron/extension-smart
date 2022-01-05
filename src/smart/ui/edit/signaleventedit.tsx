import { FormGroup } from '@blueprintjs/core';
import React, { useEffect, useState } from 'react';
import MGDDisplayPane from '../../MGDComponents/MGDDisplayPane';
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
}> = function ({
  model,
  act,
  event,
  closeDialog,
  minimal,
  onFullEditClick,
  onDeleteClick,
  setSelectedNode,
}) {
  const signals = getModelAllSignals(model);

  const [editing, setEditing] = useState<EditorSignalEvent>({ ...event });
  const [hasChange, setHasChange] = useState<boolean>(false);

  function onUpdateClick() {
    const action: ModelAction = {
      type: 'model',
      act: 'elements',
      task: 'edit',
      subtask: 'flowunit',
      id: event.id,
      value: editing,
    };
    act(action);
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
      setHasChange(true);
    }
  }

  function saveOnExit() {
    setHasChange(hc => {
      if (hc) {
        setEditing(edit => {
          const action: ModelAction = {
            type: 'model',
            act: 'elements',
            task: 'edit',
            subtask: 'flowunit',
            id: event.id,
            value: edit,
          };
          act(action);
          return edit;
        });
      }
      return false;
    });
  }

  function onNewID(id: string) {
    const action: ModelAction = {
      type: 'model',
      act: 'elements',
      task: 'edit',
      subtask: 'flowunit',
      id: event.id,
      value: { ...editing, id },
    };
    act(action);
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
  }
> = function (props) {
  const { model, editing, setEditing, scEvent, saveOnExit, onNewID } = props;

  useEffect(() => saveOnExit, [scEvent]);

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
  }
> = function (props) {
  const { editing, setEditing, signals } = props;
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
