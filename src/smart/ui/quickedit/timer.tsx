/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { jsx } from '@emotion/react';
import React from 'react';
import { EditorModel, EditorTimerEvent } from '../../model/editormodel';
import { ModelWrapper } from '../../model/modelwrapper';
import { DataType } from '../../serialize/interface/baseinterface';
import {
  DeletableNodeTypes,
  EditableNodeTypes,
  EditAction,
} from '../../utils/constants';
import EditTimerPage from '../edit/timeredit';

const QuickEditTimer: React.FC<{
  timer: EditorTimerEvent;
  modelWrapper: ModelWrapper;
  setModel: (m: EditorModel) => void;
  setDialog: (
    nodeType: EditableNodeTypes | DeletableNodeTypes,
    action: EditAction,
    id: string
  ) => void;
  getLatestLayoutMW?: () => ModelWrapper;
  setSelectedNode: (id: string) => void;
}> = props => {
  const { timer, setDialog } = props;

  function onFullEditClick() {
    setDialog(DataType.TIMEREVENT, EditAction.EDIT, timer.id);
  }

  function onDeleteClick() {
    setDialog(DataType.TIMEREVENT, EditAction.DELETE, timer.id);
  }

  const functionProps = {
    onFullEditClick,
    onDeleteClick,
  };

  return <EditTimerPage {...props} {...functionProps} id={timer.id} minimal />;
};

export default QuickEditTimer;
