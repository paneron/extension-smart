/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { jsx } from '@emotion/react';
import React from 'react';
import { EditorApproval, EditorModel } from '../../model/editormodel';
import { ModelWrapper } from '../../model/modelwrapper';
import { DataType } from '../../serialize/interface/baseinterface';
import {
  DeletableNodeTypes,
  EditableNodeTypes,
  EditAction,
} from '../../utils/constants';
import EditApprovalPage from '../edit/approvaledit';

const QuickEditApproval: React.FC<{
  approval: EditorApproval;
  modelWrapper: ModelWrapper;
  setModel: (m: EditorModel) => void;
  setDialog: (
    nodeType: EditableNodeTypes | DeletableNodeTypes,
    action: EditAction,
    id: string
  ) => void;
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

  return (
    <EditApprovalPage {...props} {...functionProps} id={approval.id} minimal />
  );
};

export default QuickEditApproval;
