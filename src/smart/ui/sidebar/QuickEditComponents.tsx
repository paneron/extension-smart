import React from 'react';
import { ModelAction } from '../../model/editor/model';
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
import { ModelWrapper } from '../../model/modelwrapper';
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

const NODE_EDIT_VIEWS: Record<
  QuickEditableNodeTypes,
  React.FC<{
    node: EditorNode;
    modelWrapper: ModelWrapper;
    model: EditorModel;
    setModel: (m: EditorModel) => void;
    act: (x: ModelAction) => void;
    setDialog: DialogSetterInterface;
    page: EditorSubprocess;
    provision?: RefTextSelection;
    setSelectedNode: (id: string) => void;
  }>
> = {
  [DataType.ENDEVENT]: props => (
    <QuickEditEnd {...props} end={props.node as EditorEndEvent} />
  ),
  [DataType.TIMEREVENT]: props => (
    <QuickEditTimer {...props} timer={props.node as EditorTimerEvent} />
  ),
  [DataType.SIGNALCATCHEVENT]: props => (
    <QuickEditSignalEvent {...props} event={props.node as EditorSignalEvent} />
  ),
  [DataType.EGATE]: props => (
    <QuickEditEGate {...props} egate={props.node as EditorEGate} />
  ),
  [DataType.APPROVAL]: props => (
    <QuickEditApproval {...props} approval={props.node as EditorApproval} />
  ),
  [DataType.PROCESS]: props => (
    <QuickEditProcess
      {...props}
      process={props.node as EditorProcess}
      model={props.modelWrapper.model}
    />
  ),
  [DataType.REGISTRY]: props => (
    <QuickEditRegistry
      setModel={props.setModel}
      provision={props.provision}
      registry={props.node as EditorRegistry}
      model={props.modelWrapper.model}
    />
  ),
  [DataType.DATACLASS]: props => (
    <QuickEditDataClass
      setModel={props.setModel}
      provision={props.provision}
      dataclass={props.node as EditorDataClass}
      model={props.modelWrapper.model}
    />
  ),
};

const QuickEdit: React.FC<{
  node: EditorNode;
  model: EditorModel;
  modelWrapper: ModelWrapper; // will be removed
  setModel: (m: EditorModel) => void;
  act: (x: ModelAction) => void;
  setDialog: DialogSetterInterface;
  page: EditorSubprocess;
  provision?: RefTextSelection;
  setSelectedNode: (id: string) => void;
}> = function (props) {
  const { node } = props;
  const Edit = NODE_EDIT_VIEWS[node.datatype as QuickEditableNodeTypes];

  return <Edit {...props} />;
};

export default QuickEdit;
