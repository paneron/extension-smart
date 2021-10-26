import React from 'react';
import BasicSettingPane from '../control/settings';
import { EditorModel } from '../../model/editormodel';
import { ModelWrapper } from '../../model/modelwrapper';
import { ConfirmDialog } from './confirmdialog';
import {
  DeletableNodeTypes,
  EditableNodeTypes,
  EditAction,
} from '../../utils/constants';
import {
  DeleteAction,
  DeleteConfirmMessgae,
} from '../../utils/ModelRemoveComponentHandler';
import { DataType } from '../../serialize/interface/baseinterface';
import EditProcessPage from '../edit/processedit';
import EditApprovalPage from '../edit/approvaledit';
import EditEGatePage from '../edit/egateedit';
import EditTimerPage from '../edit/timeredit';
import EditSignalEventPage from '../edit/signaleventedit';
import { MMELMetadata } from '../../serialize/interface/supportinterface';
import { IToastProps } from '@blueprintjs/core';
import { MMELRepo } from '../../model/repo';

export enum DiagTypes {
  SETTING = 'setting',
  DELETECONFIRM = 'confirm',
  EDITPROCESS = 'process',
  EDITAPPROVAL = 'approval',
  EDITTIMER = 'timer',
  EDITSIGNAL = 'signal',
  EDITEGATE = 'gate',
}

export enum MapperDiagTypes {
  EDITMAPPING = 'map',
  DOCUMENT = 'document',
}

export interface MapperDiagPackage {
  type: MapperDiagTypes | null;
  payload: EditMPropsInterface;
}

export interface DiagPackage {
  type: DiagTypes | null;
  callback: () => void;
  msg: string;
}

export interface IDiagInterface {
  modelwrapper: ModelWrapper;
  setModelWrapper: (mw: ModelWrapper) => void;
  onMetaChanged: (meta: MMELMetadata) => void;
  callback: () => void;
  cancel: () => void;
  showMsg: (msg: IToastProps) => void;
  msg: string;
  repo: MMELRepo | undefined;
}

export interface EditorDiagProps {
  title: string;
  Panel: React.FC<IDiagInterface>;
  fullscreen: boolean;
}

export interface IDiagAction {
  nodeType: DeletableNodeTypes | EditableNodeTypes;
  model: EditorModel;
  page: string;
  id: string;
  setModelAfterDelete: (model: EditorModel) => void;
}

export interface EditMPropsInterface {
  from: string;
  to: string;
}

function updateModel(
  model: EditorModel,
  setModelWrapper: (mw: ModelWrapper) => void,
  mw: ModelWrapper
) {
  setModelWrapper({ ...mw, model: { ...model } });
}

export const MyDiag: Record<DiagTypes, EditorDiagProps> = {
  [DiagTypes.SETTING]: {
    title: 'Setting',
    fullscreen: true,
    Panel: ({
      modelwrapper,
      setModelWrapper,
      onMetaChanged,
      showMsg,
      repo,
    }) => (
      <BasicSettingPane
        model={modelwrapper.model}
        setModel={(model: EditorModel) =>
          updateModel(model, setModelWrapper, modelwrapper)
        }
        onMetaChanged={onMetaChanged}
        showMsg={showMsg}
        repo={repo}
      />
    ),
  },
  [DiagTypes.DELETECONFIRM]: {
    title: 'Confirmation',
    fullscreen: false,
    Panel: ({ callback, cancel, msg }) => (
      <ConfirmDialog callback={callback} cancel={cancel} msg={msg} />
    ),
  },
  [DiagTypes.EDITPROCESS]: {
    title: 'Edit Process',
    fullscreen: true,
    Panel: ({ modelwrapper, setModelWrapper, cancel, msg }) => (
      <EditProcessPage
        model={modelwrapper.model}
        setModel={(m: EditorModel) =>
          updateModel(m, setModelWrapper, modelwrapper)
        }
        id={msg}
        closeDialog={cancel}
      />
    ),
  },
  [DiagTypes.EDITAPPROVAL]: {
    title: 'Edit Approval',
    fullscreen: true,
    Panel: ({ modelwrapper, setModelWrapper, cancel, msg }) => (
      <EditApprovalPage
        modelWrapper={modelwrapper}
        setModel={(m: EditorModel) =>
          updateModel(m, setModelWrapper, modelwrapper)
        }
        id={msg}
        closeDialog={cancel}
      />
    ),
  },
  [DiagTypes.EDITEGATE]: {
    title: 'Edit Gateway',
    fullscreen: true,
    Panel: ({ modelwrapper, setModelWrapper, cancel, msg }) => (
      <EditEGatePage
        modelWrapper={modelwrapper}
        setModel={(m: EditorModel) =>
          updateModel(m, setModelWrapper, modelwrapper)
        }
        id={msg}
        closeDialog={cancel}
      />
    ),
  },
  [DiagTypes.EDITTIMER]: {
    title: 'Edit Timer',
    fullscreen: true,
    Panel: ({ modelwrapper, setModelWrapper, cancel, msg }) => (
      <EditTimerPage
        modelWrapper={modelwrapper}
        setModel={(m: EditorModel) =>
          updateModel(m, setModelWrapper, modelwrapper)
        }
        id={msg}
        closeDialog={cancel}
      />
    ),
  },
  [DiagTypes.EDITSIGNAL]: {
    title: 'Edit Signal Catch Event',
    fullscreen: true,
    Panel: ({ modelwrapper, setModelWrapper, cancel, msg }) => (
      <EditSignalEventPage
        modelWrapper={modelwrapper}
        setModel={(m: EditorModel) =>
          updateModel(m, setModelWrapper, modelwrapper)
        }
        id={msg}
        closeDialog={cancel}
      />
    ),
  },
};

export const SetDiagAction: Record<
  EditAction,
  (props: IDiagAction) => DiagPackage
> = {
  [EditAction.DELETE]: setDeleteAction,
  [EditAction.EDIT]: setEditAction,
};

const EditNodeType: Record<EditableNodeTypes, DiagTypes> = {
  [DataType.PROCESS]: DiagTypes.EDITPROCESS,
  [DataType.APPROVAL]: DiagTypes.EDITAPPROVAL,
  [DataType.TIMEREVENT]: DiagTypes.EDITTIMER,
  [DataType.SIGNALCATCHEVENT]: DiagTypes.EDITSIGNAL,
  [DataType.EGATE]: DiagTypes.EDITEGATE,
};

function setEditAction(props: IDiagAction): DiagPackage {
  return {
    type: EditNodeType[props.nodeType as EditableNodeTypes],
    callback: () => {},
    msg: props.id,
  };
}

function setDeleteAction(props: IDiagAction): DiagPackage {
  return {
    type: DiagTypes.DELETECONFIRM,
    callback: () => {
      const updated = DeleteAction[props.nodeType](
        props.model,
        props.page,
        props.id
      );
      props.setModelAfterDelete(updated);
    },
    msg: DeleteConfirmMessgae[props.nodeType],
  };
}
