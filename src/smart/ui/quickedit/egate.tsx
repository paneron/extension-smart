import React from 'react';
import { ModelAction } from '@/smart/model/editor/model';
import {
  EditorEGate,
  EditorModel,
  EditorSubprocess,
} from '@/smart/model/editormodel';
import { DataType } from '@paneron/libmmel/interface/baseinterface';
import { EditAction } from '@/smart/utils/constants';
import { DialogSetterInterface } from '@/smart/ui/dialog/EditorDialogs';
import EditEGatePage from '@/smart/ui/edit/egateedit';

const QuickEditEGate: React.FC<{
  egate: EditorEGate;
  model: EditorModel;
  page: EditorSubprocess;
  act: (x: ModelAction) => void;
  setDialog: DialogSetterInterface;
  setSelectedNode: (id: string) => void;
  setUndoListener: (x: (() => void) | undefined) => void;
  clearRedo: () => void;
}> = props => {
  const { egate, setDialog } = props;

  function onFullEditClick() {
    setDialog(DataType.EGATE, EditAction.EDIT, egate.id);
  }

  function onDeleteClick() {
    setDialog(DataType.EGATE, EditAction.DELETE, egate.id);
  }

  const functionProps = {
    onFullEditClick,
    onDeleteClick,
  };

  return <EditEGatePage {...props} {...functionProps} egate={egate} minimal />;
};

export default QuickEditEGate;
