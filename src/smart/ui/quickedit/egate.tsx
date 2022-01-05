import React from 'react';
import { ModelAction } from '../../model/editor/model';
import {
  EditorEGate,
  EditorModel,
  EditorSubprocess,
} from '../../model/editormodel';
import { DataType } from '../../serialize/interface/baseinterface';
import { EditAction } from '../../utils/constants';
import { DialogSetterInterface } from '../dialog/EditorDialogs';
import EditEGatePage from '../edit/egateedit';

const QuickEditEGate: React.FC<{
  egate: EditorEGate;
  model: EditorModel;
  page: EditorSubprocess;
  act: (x: ModelAction) => void;
  setDialog: DialogSetterInterface;
  setSelectedNode: (id: string) => void;
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
