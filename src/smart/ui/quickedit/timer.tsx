import React from 'react';
import type { ModelAction } from '@/smart/model/editor/model';
import type { EditorModel, EditorTimerEvent } from '@/smart/model/editormodel';
import { DataType } from '@paneron/libmmel/interface/baseinterface';
import { EditAction } from '@/smart/utils/constants';
import type { DialogSetterInterface } from '@/smart/ui/dialog/EditorDialogs';
import EditTimerPage from '@/smart/ui/edit/timeredit';

const QuickEditTimer: React.FC<{
  timer: EditorTimerEvent;
  model: EditorModel;
  act: (x: ModelAction) => void;
  setDialog: DialogSetterInterface;
  setSelectedNode: (id: string) => void;
  setUndoListener: (x: (() => void) | undefined) => void;
  clearRedo: () => void;
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

  return <EditTimerPage {...props} {...functionProps} minimal />;
};

export default QuickEditTimer;
