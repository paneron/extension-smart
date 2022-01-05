import React from 'react';
import { ModelAction } from '../../model/editor/model';
import { EditorModel, EditorTimerEvent } from '../../model/editormodel';
import { DataType } from '../../serialize/interface/baseinterface';
import { EditAction } from '../../utils/constants';
import { DialogSetterInterface } from '../dialog/EditorDialogs';
import EditTimerPage from '../edit/timeredit';

const QuickEditTimer: React.FC<{
  timer: EditorTimerEvent;
  model: EditorModel;
  act: (x: ModelAction) => void;
  setDialog: DialogSetterInterface;
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

  return <EditTimerPage {...props} {...functionProps} timer={timer} minimal />;
};

export default QuickEditTimer;
