/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { jsx } from '@emotion/react';
import React from 'react';
import { EditorEGate, EditorModel } from '../../model/editormodel';
import { ModelWrapper } from '../../model/modelwrapper';
import { DataType } from '../../serialize/interface/baseinterface';
import {
  DeletableNodeTypes,
  EditableNodeTypes,
  EditAction,
} from '../../utils/constants';
import EditEGatePage from '../edit/egateedit';

const QuickEditEGate: React.FC<{
  egate: EditorEGate;
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

  return <EditEGatePage {...props} {...functionProps} id={egate.id} minimal />;
};

export default QuickEditEGate;
