import React from 'react';
import { EditorModel, EditorTimerEvent } from '../../model/editormodel';
import { ModelWrapper } from '../../model/modelwrapper';
import { EditableNodeTypes } from '../../utils/constants';
import { DataType } from '../../serialize/interface/baseinterface';
import EditProcessPage from '../edit/processedit';
import EditApprovalPage from '../edit/approvaledit';
import EditEGatePage from '../edit/egateedit';
import EditTimerPage from '../edit/timeredit';
import EditSignalEventPage from '../edit/signaleventedit';
import { EditorAction } from '../../model/editor/state';
import { ConfirmDialog } from './confirmdialog';

export enum EditorDiagTypes {
  DELETECONFIRM = 'confirm',
  EDITPROCESS = 'process',
  EDITAPPROVAL = 'approval',
  EDITTIMER = 'timer',
  EDITSIGNAL = 'signal',
  EDITEGATE = 'gate',
}

export interface EditorDiagPackage {
  type: EditorDiagTypes;
  onDelete?: () => void;
  msg: string;
}

export type EditorDialogInterface = {
  model: EditorModel;
  page: string;  
  setModelWrapper: (mw: ModelWrapper) => void;
  act: (x: EditorAction) => void;
  onDelete?: () => void;
  done: () => void;
  msg: string;
  setSelectedNode: (id: string) => void;
};

export type EditorDiagProps = {
  title: string;
  Panel: React.FC<EditorDialogInterface>;
  fullscreen: boolean;
};

export const EditorDiag: Record<EditorDiagTypes, EditorDiagProps> = {
  [EditorDiagTypes.DELETECONFIRM]: {
    title: 'Confirmation',
    fullscreen: false,
    Panel: ({ onDelete, done, msg }) =>
      onDelete ? (
        <ConfirmDialog callback={onDelete} done={done} msg={msg} />
      ) : (
        <></>
      ),
  },
  [EditorDiagTypes.EDITPROCESS]: {
    title: 'Edit Process',
    fullscreen: true,
    Panel: ({ model, done, msg, setSelectedNode }) => (
      <EditProcessPage
        model={model}
        setModel={(m: EditorModel) => {}}
        id={msg}
        closeDialog={done}
        setSelectedNode={setSelectedNode}
      />
    ),
  },
  [EditorDiagTypes.EDITAPPROVAL]: {
    title: 'Edit Approval',
    fullscreen: true,
    Panel: ({ model, page, done, msg, setSelectedNode }) => (
      <EditApprovalPage
        modelWrapper={{ model, page, type: 'model' }}
        setModel={(m: EditorModel) => {}}
        id={msg}
        closeDialog={done}
        setSelectedNode={setSelectedNode}
      />
    ),
  },
  [EditorDiagTypes.EDITEGATE]: {
    title: 'Edit Gateway',
    fullscreen: true,
    Panel: ({ model, page, done, msg, setSelectedNode }) => (
      <EditEGatePage
        modelWrapper={{ model, page, type: 'model' }}
        setModel={() => {}}
        id={msg}
        closeDialog={done}
        setSelectedNode={setSelectedNode}
      />
    ),
  },
  [EditorDiagTypes.EDITTIMER]: {
    title: 'Edit Timer',
    fullscreen: true,
    Panel: ({ model, act, done, msg, setSelectedNode }) => (
      <EditTimerPage
        model={model}
        act={act}
        timer={model.elements[msg] as EditorTimerEvent}
        closeDialog={done}
        setSelectedNode={setSelectedNode}
      />
    ),
  },
  [EditorDiagTypes.EDITSIGNAL]: {
    title: 'Edit Signal Catch Event',
    fullscreen: true,
    Panel: ({ model, page, done, msg, setSelectedNode }) => (
      <EditSignalEventPage
        modelWrapper={{ model, page, type: 'model' }}
        setModel={() => {}}
        id={msg}
        closeDialog={done}
        setSelectedNode={setSelectedNode}
      />
    ),
  },
};

export const EditNodeType: Record<EditableNodeTypes, EditorDiagTypes> = {
  [DataType.PROCESS]: EditorDiagTypes.EDITPROCESS,
  [DataType.APPROVAL]: EditorDiagTypes.EDITAPPROVAL,
  [DataType.TIMEREVENT]: EditorDiagTypes.EDITTIMER,
  [DataType.SIGNALCATCHEVENT]: EditorDiagTypes.EDITSIGNAL,
  [DataType.EGATE]: EditorDiagTypes.EDITEGATE,
};
