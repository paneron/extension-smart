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
}> = function ({
  modelWrapper,
  setModel,
  id,
  closeDialog,
  minimal,
  onFullEditClick,
  onDeleteClick,
}) {
  const model = modelWrapper.model;
  const scEvent = model.elements[id] as EditorSignalEvent;

  const signals = getModelAllSignals(model);

  const [editing, setEditing] = useState<EditorSignalEvent>({ ...scEvent });

  function onUpdateClick() {
    const updated = save(id, editing, modelWrapper.page, model);
    if (updated !== null) {
      setModel({ ...updated });
      if (closeDialog !== undefined) {
        closeDialog();
      }
    }
  }

  const commonProps: CommonSignalEditProps = {
    onUpdateClick,
    editing,
    setEditing,
    onDeleteClick,
    onFullEditClick,
  };

  const fullEditProps = { closeDialog, signals };

  useEffect(() => setEditing(scEvent), [scEvent]);

  return minimal ? (
    <QuickVersionEdit {...commonProps} />
  ) : (
    <FullVersionEdit {...commonProps} {...fullEditProps} />
  );
};

const QuickVersionEdit: React.FC<CommonSignalEditProps> = function (props) {
  const { editing, setEditing } = props;
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
