import React from 'react';
import { ModelAction } from '../../model/editor/model';
import {
  EditorModel,
  EditorSubprocess,
  EditorTimerEvent,
} from '../../model/editormodel';
import { DataType } from '../../serialize/interface/baseinterface';
import {
  DeletableNodeTypes,
  EditableNodeTypes,
  EditAction,
} from '../../utils/constants';
import EditTimerPage from '../edit/timeredit';

const QuickEditTimer: React.FC<{
  timer: EditorTimerEvent;
  model: EditorModel;
  act: (x: ModelAction) => void;
  setDialog: (
    nodeType: EditableNodeTypes | DeletableNodeTypes,
    action: EditAction,
    id: string
  ) => void;
  setSelectedNode: (id: string) => void;
  page: EditorSubprocess;
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

  return <EditTimerPage {...props} {...functionProps} timer={timer} minimal />;
};

export default QuickEditTimer;
