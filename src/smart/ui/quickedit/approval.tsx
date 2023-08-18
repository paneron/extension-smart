import React from 'react';
import type { ModelAction } from '@/smart/model/editor/model';
import type { EditorApproval, EditorModel } from '@/smart/model/editormodel';
import { DataType } from '@paneron/libmmel/interface/baseinterface';
import { EditAction } from '@/smart/utils/constants';
import type { DialogSetterInterface } from '@/smart/ui/dialog/EditorDialogs';
import EditApprovalPage from '@/smart/ui/edit/approvaledit';

const QuickEditApproval: React.FC<{
  approval: EditorApproval;
  model: EditorModel;
  act: (x: ModelAction) => void;
  setDialog: DialogSetterInterface;
  setSelectedNode: (id: string) => void;
  setUndoListener: (x: (() => void) | undefined) => void;
  clearRedo: () => void;
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
