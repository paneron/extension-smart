import React from 'react';
import { EditorAction } from '../../model/editor/state';
import {
  EditorApproval,
  EditorDataClass,
  EditorEGate,
  EditorEndEvent,
  EditorModel,
  EditorNode,
  EditorProcess,
  EditorRegistry,
  EditorSignalEvent,
  EditorSubprocess,
  EditorTimerEvent,
} from '../../model/editormodel';
import { RefTextSelection } from '../../model/selectionImport';
import { DataType } from '../../serialize/interface/baseinterface';
import { QuickEditableNodeTypes } from '../../utils/constants';
import { DialogSetterInterface } from '../dialog/EditorDialogs';
import QuickEditApproval from '../quickedit/approval';
import QuickEditDataClass from '../quickedit/dataclass';
import QuickEditEGate from '../quickedit/egate';
import QuickEditEnd from '../quickedit/end';
import QuickEditProcess from '../quickedit/process';
import QuickEditRegistry from '../quickedit/registry';
import QuickEditSignalEvent from '../quickedit/signalevent';
import QuickEditTimer from '../quickedit/timer';

interface Props {
    node: EditorNode;
    model: EditorModel;
    act: (x: EditorAction) => void;
    setDialog: DialogSetterInterface;
    page: EditorSubprocess;
    provision?: RefTextSelection;
    setSelectedNode: (id: string) => void;
    setUndoListener: (x: (() => void) | undefined) => void;
    clearRedo: () => void;
}

const NODE_EDIT_VIEWS: Record<
  QuickEditableNodeTypes,
  React.FC<Props>
> = {
  [DataType.ENDEVENT] : (props: Props) => (
    <QuickEditEnd {...props} end={props.node as EditorEndEvent} />
  ),
  [DataType.TIMEREVENT] : (props: Props) => (
    <QuickEditTimer {...props} timer={props.node as EditorTimerEvent} />
  ),
  [DataType.SIGNALCATCHEVENT] : (props: Props) => (
    <QuickEditSignalEvent {...props} event={props.node as EditorSignalEvent} />
  ),
  [DataType.EGATE] : (props: Props) => (
    <QuickEditEGate {...props} egate={props.node as EditorEGate} />
  ),
  [DataType.APPROVAL] : (props: Props) => (
    <QuickEditApproval {...props} approval={props.node as EditorApproval} />
  ),
  [DataType.PROCESS] : (props: Props) => (
    <QuickEditProcess {...props} process={props.node as EditorProcess} />
  ),
  [DataType.REGISTRY] : (props: Props) => (
    <QuickEditRegistry {...props} registry={props.node as EditorRegistry} />
  ),
  [DataType.DATACLASS] : (props: Props) => (
    <QuickEditDataClass {...props} dataclass={props.node as EditorDataClass} />
  ),
};

interface QuickEditProps {
    node: EditorNode;
    model: EditorModel;
    act: (x: EditorAction) => void;
    setDialog: DialogSetterInterface;
    page: EditorSubprocess;
    provision?: RefTextSelection;
    setSelectedNode: (id: string) => void;
    setUndoListener: (x: (() => void) | undefined) => void;
    clearRedo: () => void;
}

const QuickEdit: React.FC<QuickEditProps> = function (props) {
  const { node } = props;
  const Edit = NODE_EDIT_VIEWS[node.datatype as QuickEditableNodeTypes];

  return <Edit {...props} />;
};

export default QuickEdit;
