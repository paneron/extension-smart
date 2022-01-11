import React from 'react';
import { ModelAction } from '../../model/editor/model';
import { EditorModel, EditorSignalEvent } from '../../model/editormodel';
import { DataType } from '../../serialize/interface/baseinterface';
import { EditAction } from '../../utils/constants';
import { DialogSetterInterface } from '../dialog/EditorDialogs';
import EditSignalEventPage from '../edit/signaleventedit';

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
