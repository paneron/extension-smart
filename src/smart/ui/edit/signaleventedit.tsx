/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { FormGroup } from '@blueprintjs/core';
import { jsx } from '@emotion/react';
import React, { useEffect, useState } from 'react';
import MGDDisplayPane from '../../MGDComponents/MGDDisplayPane';
import { EditorModel, EditorSignalEvent } from '../../model/editormodel';
import { ModelWrapper } from '../../model/modelwrapper';
import {
  checkId,
  getModelAllSignals,
  removeSpace,
  updatePageElement,
} from '../../utils/ModelFunctions';
import { DescriptionItem } from '../common/description/fields';
import { NormalTextField, ReferenceSelector } from '../common/fields';
import { EditPageButtons } from './commons';

interface CommonSignalEditProps {
  onUpdateClick: () => void;
  editing: EditorSignalEvent;
  setEditing: (x: EditorSignalEvent) => void;
  onFullEditClick?: () => void;
  onDeleteClick?: () => void;
}

const EditSignalEventPage: React.FC<{
  modelWrapper: ModelWrapper;
  setModel: (m: EditorModel) => void;
  id: string;
  closeDialog?: () => void;
  minimal?: boolean;
  onFullEditClick?: () => void;
  onDeleteClick?: () => void;
  getLatestLayoutMW?: () => ModelWrapper;
  setSelectedNode?: (id: string) => void;
}> = function ({
  modelWrapper,
  setModel,
  id,
  closeDialog,
  minimal,
  onFullEditClick,
  onDeleteClick,
  getLatestLayoutMW,
  setSelectedNode,
}) {
  const model = modelWrapper.model;
  const scEvent = model.elements[id] as EditorSignalEvent;

  const signals = getModelAllSignals(model);

  const [editing, setEditing] = useState<EditorSignalEvent>({ ...scEvent });
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
    const oldid = scEvent.id;
    if (getLatestLayoutMW !== undefined) {
      const mw = getLatestLayoutMW();
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
    scEvent,
    setEditing: setEdit,
    initID: scEvent.id,
    validTest: (id: string) => id === scEvent.id || checkId(id, model.elements),
    onNewID,
  };

  useEffect(() => setEditing(scEvent), [scEvent]);

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
  }
> = function (props) {
  const { editing, setEditing, scEvent, saveOnExit } = props;

  useEffect(() => saveOnExit, [scEvent]);

  return (
    <FormGroup>
      <EditPageButtons {...props} />
      <DescriptionItem label="Signal Catch Event ID" value={editing.id} />
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
