import React from 'react';
import { EditorModel, EditorSignalEvent } from '../../model/editormodel';
import { ModelWrapper } from '../../model/modelwrapper';
import { DataType } from '../../serialize/interface/baseinterface';
import {
  DeletableNodeTypes,
  EditableNodeTypes,
  EditAction,
} from '../../utils/constants';
import EditSignalEventPage from '../edit/signaleventedit';

const QuickEditSignalEvent: React.FC<{
  event: EditorSignalEvent;
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

  return (
    <EditSignalEventPage {...props} {...functionProps} id={event.id} minimal />
  );
};

export default QuickEditSignalEvent;
