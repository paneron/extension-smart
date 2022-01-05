import React from 'react';
import { ModelAction } from '../../model/editor/model';
import { EditorApproval, EditorModel } from '../../model/editormodel';
import { DataType } from '../../serialize/interface/baseinterface';
import { EditAction } from '../../utils/constants';
import { DialogSetterInterface } from '../dialog/EditorDialogs';
import EditApprovalPage from '../edit/approvaledit';

const QuickEditApproval: React.FC<{
  approval: EditorApproval;
  model: EditorModel;
  act: (x: ModelAction) => void;
  setDialog: DialogSetterInterface;
  setSelectedNode: (id: string) => void;
}> = props => {
  const { approval, setDialog } = props;

  function onFullEditClick() {
    setDialog(DataType.APPROVAL, EditAction.EDIT, approval.id);
  }

  function onDeleteClick() {
    setDialog(DataType.APPROVAL, EditAction.DELETE, approval.id);
  }

  const functionProps = {
    onFullEditClick,
    onDeleteClick,
  };

  return <EditApprovalPage {...props} {...functionProps} minimal />;
};

export default QuickEditApproval;
