import React from 'react';
import { EditorModel, EditorProcess } from '../../model/editormodel';
import { ModelWrapper } from '../../model/modelwrapper';
import { RefTextSelection } from '../../model/selectionImport';
import { DataType } from '../../serialize/interface/baseinterface';
import {
  DeletableNodeTypes,
  EditableNodeTypes,
  EditAction,
} from '../../utils/constants';
import { createNewPage } from '../../utils/ModelAddComponentHandler';
import EditProcessPage from '../edit/processedit';

const QuickEditProcess: React.FC<{
  process: EditorProcess;
  model: EditorModel;
  setModel: (m: EditorModel) => void;
  setDialog: (
    nodeType: EditableNodeTypes | DeletableNodeTypes,
    action: EditAction,
    id: string
  ) => void;
  provision?: RefTextSelection;
  getLatestLayoutMW?: () => ModelWrapper;
  setSelectedNode: (id: string) => void;
}> = props => {
  const { process, model, setModel, setDialog } = props;

  function onSubprocessClick(): void {
    const p = model.elements[process.id] as EditorProcess;
    p.page = createNewPage(model);
    setModel({ ...model });
  }

  function onFullEditClick() {
    setDialog(DataType.PROCESS, EditAction.EDIT, process.id);
  }

  function onDeleteClick() {
    setDialog(DataType.PROCESS, EditAction.DELETE, process.id);
  }

  const functionProps = {
    onFullEditClick,
    onDeleteClick,
    onSubprocessClick: process.page === '' ? onSubprocessClick : undefined,
  };

  return (
    <EditProcessPage {...props} {...functionProps} id={process.id} minimal />
  );
};

export default QuickEditProcess;
