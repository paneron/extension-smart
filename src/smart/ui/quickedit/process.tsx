import React from 'react';
import {
  createSubprocessCommand,
  deleteSubprocessCommand,
} from '../../model/editor/commands/elements';
import { ModelAction } from '../../model/editor/model';
import { EditorModel, EditorProcess } from '../../model/editormodel';
import { RefTextSelection } from '../../model/selectionImport';
import { DataType } from '../../serialize/interface/baseinterface';
import { EditAction } from '../../utils/constants';
import { DialogSetterInterface } from '../dialog/EditorDialogs';
import EditProcessPage from '../edit/processedit';

const QuickEditProcess: React.FC<{
  process: EditorProcess;
  model: EditorModel;
  act: (x: ModelAction) => void;
  setDialog: DialogSetterInterface;
  provision?: RefTextSelection;
  setSelectedNode: (id: string) => void;
}> = props => {
  const { process, act, setDialog } = props;

  function onSubprocessClick(): void {
    act(createSubprocessCommand(process.id));
  }

  function onSubprocessRemoveClick(): void {
    act(deleteSubprocessCommand(process.id));
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
    onSubprocessRemoveClick:
      process.page !== '' ? onSubprocessRemoveClick : undefined,
  };

  return <EditProcessPage {...props} {...functionProps} minimal />;
};

export default QuickEditProcess;
