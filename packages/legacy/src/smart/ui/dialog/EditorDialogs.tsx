import React from 'react';
import {
  EditorApproval,
  EditorEGate,
  EditorModel,
  EditorProcess,
  EditorSignalEvent,
  EditorTimerEvent,
} from '../../model/editormodel';
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
import { ConfirmDialog } from './confirmdialog';

export type DialogSetterInterface = (
  nodeType: EditableNodeTypes | DeletableNodeTypes,
  action: EditAction,
  id: string
) => void;

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
  act: (x: EditorAction) => void;
  onDelete?: () => void;
  done: () => void;
  msg: string;
  setSelectedNode: (id: string) => void;
  setUndoListener: (x: (() => void) | undefined) => void;
  clearRedo: () => void;
};

export type EditorDiagProps = {
  title: string;
  Panel: React.FC<EditorDialogInterface>;
  fullscreen: boolean;
};

export const EditorDiag: Record<EditorDiagTypes, EditorDiagProps> = {
  [EditorDiagTypes.DELETECONFIRM] : {
    title      : 'Confirmation',
    fullscreen : false,
    Panel      : ({ onDelete, done, msg }: EditorDialogInterface) =>
      onDelete ? (
        <ConfirmDialog callback={onDelete} done={done} msg={msg} />
      ) : (
        <></>
      ),
  },
  [EditorDiagTypes.EDITPROCESS] : {
    title      : 'Edit Process',
    fullscreen : true,
    Panel      : (props: EditorDialogInterface) => (
      <EditProcessPage
        {...props}
        closeDialog={props.done}
        process={props.model.elements[props.msg] as EditorProcess}
      />
    ),
  },
  [EditorDiagTypes.EDITAPPROVAL] : {
    title      : 'Edit Approval',
    fullscreen : true,
    Panel      : (props: EditorDialogInterface) => (
      <EditApprovalPage
        {...props}
        closeDialog={props.done}
        approval={props.model.elements[props.msg] as EditorApproval}
      />
    ),
  },
  [EditorDiagTypes.EDITEGATE] : {
    title      : 'Edit Gateway',
    fullscreen : true,
    Panel      : (props: EditorDialogInterface) => (
      <EditEGatePage
        {...props}
        closeDialog={props.done}
        page={props.model.pages[props.page]}
        egate={props.model.elements[props.msg] as EditorEGate}
      />
    ),
  },
  [EditorDiagTypes.EDITTIMER] : {
    title      : 'Edit Timer',
    fullscreen : true,
    Panel      : (props: EditorDialogInterface) => (
      <EditTimerPage
        {...props}
        timer={props.model.elements[props.msg] as EditorTimerEvent}
        closeDialog={props.done}
      />
    ),
  },
  [EditorDiagTypes.EDITSIGNAL] : {
    title      : 'Edit Signal Catch Event',
    fullscreen : true,
    Panel      : (props: EditorDialogInterface) => (
      <EditSignalEventPage
        {...props}
        event={props.model.elements[props.msg] as EditorSignalEvent}
        closeDialog={props.done}
      />
    ),
  },
};

export const EditNodeType: Record<EditableNodeTypes, EditorDiagTypes> = {
  [DataType.PROCESS]          : EditorDiagTypes.EDITPROCESS,
  [DataType.APPROVAL]         : EditorDiagTypes.EDITAPPROVAL,
  [DataType.TIMEREVENT]       : EditorDiagTypes.EDITTIMER,
  [DataType.SIGNALCATCHEVENT] : EditorDiagTypes.EDITSIGNAL,
  [DataType.EGATE]            : EditorDiagTypes.EDITEGATE,
};
