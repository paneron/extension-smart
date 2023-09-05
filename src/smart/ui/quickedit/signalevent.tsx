import React from 'react';
import type { ModelAction } from '@/smart/model/editor/model';
import type { EditorModel, EditorSignalEvent } from '@/smart/model/editormodel';
import { DataType } from '@paneron/libmmel/interface/baseinterface';
import { EditAction } from '@/smart/utils/constants';
import type { DialogSetterInterface } from '@/smart/ui/dialog/EditorDialogs';
import EditSignalEventPage from '@/smart/ui/edit/signaleventedit';

const QuickEditSignalEvent: React.FC<{
  event: EditorSignalEvent;
  model: EditorModel;
  act: (x: ModelAction) => void;
  setDialog: DialogSetterInterface;
  setSelectedNode: (id: string) => void;
  setUndoListener: (x: (() => void) | undefined) => void;
  clearRedo: () => void;
}> = props => {
  const { event, setDialog } = props;

  function onFullEditClick() {
    setDialog(DataType.SIGNALCATCHEVENT, EditAction.EDIT, event.id);
  }

  function onDeleteClick() {
    setDialog(DataType.SIGNALCATCHEVENT, EditAction.DELETE, event.id);
  }

  const functionProps = {
    onFullEditClick,
    onDeleteClick,
  };

  return <EditSignalEventPage {...props} {...functionProps} minimal />;
};

export default QuickEditSignalEvent;
