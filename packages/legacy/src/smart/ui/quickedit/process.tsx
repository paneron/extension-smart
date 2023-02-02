import React from 'react';
import {
  bringoutProcessCommand,
  createSubprocessCommand,
  deleteSubprocessCommand,
} from '../../model/editor/commands/elements';
import { ModelAction } from '../../model/editor/model';
import {
  EditorModel,
  EditorProcess,
  EditorSubprocess,
} from '../../model/editormodel';
import { RefTextSelection } from '../../model/selectionImport';
import { DataType } from '@paneron/libmmel/interface/baseinterface';
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
  page: EditorSubprocess;
  setUndoListener: (x: (() => void) | undefined) => void;
  clearRedo: () => void;
}> = props => {
  const { process, act, page, setDialog } = props;

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

  function onBringoutClick() {
    act(bringoutProcessCommand(process.id, page.id));
  }

  const functionProps = {
    onFullEditClick,
    onDeleteClick     : process.pages.size > 1 ? undefined : onDeleteClick,
    onSubprocessClick : process.page === '' ? onSubprocessClick : undefined,
    onSubprocessRemoveClick :
      process.page !== '' ? onSubprocessRemoveClick : undefined,
    onBringoutClick : process.pages.size > 1 ? onBringoutClick : undefined,
  };

  return <EditProcessPage {...props} {...functionProps} minimal />;
};

export default QuickEditProcess;
