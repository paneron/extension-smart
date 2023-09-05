import React from 'react';
import {
  bringoutProcessCommand,
  createSubprocessCommand,
  deleteSubprocessCommand,
} from '@/smart/model/editor/commands/elements';
import type { ModelAction } from '@/smart/model/editor/model';
import type {
  EditorModel,
  EditorProcess,
  EditorSubprocess,
} from '@/smart/model/editormodel';
import type { RefTextSelection } from '@/smart/model/selectionImport';
import { DataType } from '@paneron/libmmel/interface/baseinterface';
import { EditAction } from '@/smart/utils/constants';
import type { DialogSetterInterface } from '@/smart/ui/dialog/EditorDialogs';
import EditProcessPage from '@/smart/ui/edit/processedit';

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
