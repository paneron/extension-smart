import React from 'react';
import { EditorModel, EditorTimerEvent } from '../../model/editormodel';
import { ModelWrapper } from '../../model/modelwrapper';
import {
  DeletableNodeTypes,
  EditableNodeTypes,
  EditAction,
} from '../../utils/constants';
import { DataType } from '../../serialize/interface/baseinterface';
import EditProcessPage from '../edit/processedit';
import EditApprovalPage from '../edit/approvaledit';
import EditEGatePage from '../edit/egateedit';
import EditTimerPage from '../edit/timeredit';
import EditSignalEventPage from '../edit/signaleventedit';
import { EditorAction } from '../../model/editor/state';
import { EditorState } from '../../model/States';
import { ModelAction } from '../../model/editor/model';
import { ConfirmDialog } from './confirmdialog';
import {
  DeleteConfirmMessgae,
  deleteNodeAction,
} from '../../utils/ModelRemoveComponentHandler';

export enum EditorDiagTypes {
  DELETECONFIRM = 'confirm',
  EDITPROCESS = 'process',
  EDITAPPROVAL = 'approval',
  EDITTIMER = 'timer',
  EDITSIGNAL = 'signal',
  EDITEGATE = 'gate',
}

export interface EditorDiagPackage {
  type: EditorDiagTypes | undefined;
  callback: () => void;
  msg: string;
}

export type EditorDialogInterface = {
  state: EditorState;
  setModelWrapper: (mw: ModelWrapper) => void;
  act: (x: EditorAction) => void;
  callback: () => void;
  done: () => void;
  msg: string;
  setSelectedNode: (id: string) => void;
};

export type EditorDiagProps = {
  title: string;
  Panel: React.FC<EditorDialogInterface>;
  fullscreen: boolean;
};

export type EditorDiagAction = {
  nodeType: DeletableNodeTypes | EditableNodeTypes;
  model: EditorModel;
  page: string;
  id: string;
  act: (x: ModelAction) => void;
};

export const EditorDiag: Record<EditorDiagTypes, EditorDiagProps> = {
  [EditorDiagTypes.DELETECONFIRM]: {
    title: 'Confirmation',
    fullscreen: false,
    Panel: ({ callback, done, msg }) => (
      <ConfirmDialog callback={callback} done={done} msg={msg} />
    ),
  },
  [EditorDiagTypes.EDITPROCESS]: {
    title: 'Edit Process',
    fullscreen: true,
    Panel: ({ state, done: cancel, msg, setSelectedNode }) => (
      <EditProcessPage
        model={state.model}
        setModel={(m: EditorModel) => {}}
        id={msg}
        closeDialog={cancel}
        setSelectedNode={setSelectedNode}
      />
    ),
  },
  [EditorDiagTypes.EDITAPPROVAL]: {
    title: 'Edit Approval',
    fullscreen: true,
    Panel: ({ state, done: cancel, msg, setSelectedNode }) => (
      <EditApprovalPage
        modelWrapper={{ model: state.model, page: state.page, type: 'model' }}
        setModel={(m: EditorModel) => {}}
        id={msg}
        closeDialog={cancel}
        setSelectedNode={setSelectedNode}
      />
    ),
  },
  [EditorDiagTypes.EDITEGATE]: {
    title: 'Edit Gateway',
    fullscreen: true,
    Panel: ({ state, setModelWrapper, done: cancel, msg, setSelectedNode }) => (
      <EditEGatePage
        modelWrapper={{ model: state.model, page: state.page, type: 'model' }}
        setModel={() => {}}
        id={msg}
        closeDialog={cancel}
        setSelectedNode={setSelectedNode}
      />
    ),
  },
  [EditorDiagTypes.EDITTIMER]: {
    title: 'Edit Timer',
    fullscreen: true,
    Panel: ({ state, act, done: cancel, msg, setSelectedNode }) => (
      <EditTimerPage
        model={state.model}
        act={act}
        timer={state.model.elements[msg] as EditorTimerEvent}
        closeDialog={cancel}
        setSelectedNode={setSelectedNode}
      />
    ),
  },
  [EditorDiagTypes.EDITSIGNAL]: {
    title: 'Edit Signal Catch Event',
    fullscreen: true,
    Panel: ({ state, done: cancel, msg, setSelectedNode }) => (
      <EditSignalEventPage
        modelWrapper={{ model: state.model, page: state.page, type: 'model' }}
        setModel={() => {}}
        id={msg}
        closeDialog={cancel}
        setSelectedNode={setSelectedNode}
      />
    ),
  },
};

export const SetEditorDiagAction: Record<
  EditAction,
  (props: EditorDiagAction) => EditorDiagPackage
> = {
  [EditAction.DELETE]: setDeleteAction,
  [EditAction.EDIT]: setEditAction,
};

const EditNodeType: Record<EditableNodeTypes, EditorDiagTypes> = {
  [DataType.PROCESS]: EditorDiagTypes.EDITPROCESS,
  [DataType.APPROVAL]: EditorDiagTypes.EDITAPPROVAL,
  [DataType.TIMEREVENT]: EditorDiagTypes.EDITTIMER,
  [DataType.SIGNALCATCHEVENT]: EditorDiagTypes.EDITSIGNAL,
  [DataType.EGATE]: EditorDiagTypes.EDITEGATE,
};

function setEditAction(props: EditorDiagAction): EditorDiagPackage {
  return {
    type: EditNodeType[props.nodeType as EditableNodeTypes],
    callback: () => {},
    msg: props.id,
  };
}

function setDeleteAction(props: EditorDiagAction): EditorDiagPackage {
  return {
    type: EditorDiagTypes.DELETECONFIRM,
    callback: () => {
      const action = deleteNodeAction(props.model, props.page, props.id);
      props.act(action);
    },
    msg: DeleteConfirmMessgae[props.nodeType],
  };
}
