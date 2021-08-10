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

export enum DiagTypes {
  SETTING = 'setting',
  DELETECONFIRM = 'confirm',
  EDITPROCESS = 'process',
  EDITAPPROVAL = 'approval',
  EDITTIMER = 'timer',
  EDITSIGNAL = 'signal',
  EDITEGATE = 'gate',
}

export interface DiagPackage {
  type: DiagTypes | null;
  callback: () => void;
  msg: string;
}

export interface IDiagInterface {
  modelwrapper: ModelWrapper;
  setModelWrapper: (mw: ModelWrapper) => void;
  callback: () => void;
  cancel: () => void;
  msg: string;
}

export interface EditorDiagProps {
  title: string;
  Panel: React.FC<IDiagInterface>;
  fullscreen: boolean;
}

export const MyDiag: Record<DiagTypes, EditorDiagProps> = {
  [DiagTypes.SETTING]: {
    title: 'Setting',
    fullscreen: true,
    Panel: ({ modelwrapper, setModelWrapper }) => (
      <BasicSettingPane
        model={modelwrapper.model}
        setModel={(model: EditorModel) =>
          setModelWrapper({ ...modelwrapper, model: model })
        }
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
        setModel={(m:EditorModel) => setModelWrapper({ ...modelwrapper, model: m })}
        id={msg}
        cancel={cancel}
      />
    ),
  },
  [DiagTypes.EDITAPPROVAL]: {
    title: 'Edit Approval',
    fullscreen: true,
    Panel: ({ modelwrapper, setModelWrapper, msg }) => <>msg</>,
  },
  [DiagTypes.EDITEGATE]: {
    title: 'Edit Gateway',
    fullscreen: true,
    Panel: ({ modelwrapper, setModelWrapper, msg }) => <>msg</>,
  },
  [DiagTypes.EDITTIMER]: {
    title: 'Edit Timer',
    fullscreen: true,
    Panel: ({ modelwrapper, setModelWrapper, msg }) => <>msg</>,
  },
  [DiagTypes.EDITSIGNAL]: {
    title: 'Edit Signal Catch Event',
    fullscreen: true,
    Panel: ({ modelwrapper, setModelWrapper, msg }) => <>msg</>,
  },
};

export interface IDiagAction {
  nodeType: DeletableNodeTypes | EditableNodeTypes;
  model: EditorModel;
  page: string;
  id: string;
  setModelAfterDelete: (model: EditorModel) => void;
}

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
