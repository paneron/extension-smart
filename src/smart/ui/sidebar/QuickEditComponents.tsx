/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { jsx } from '@emotion/react';
import React from 'react';
import {
  EditorApproval,
  EditorEGate,
  EditorEndEvent,
  EditorModel,
  EditorNode,
  EditorProcess,
  EditorSignalEvent,
  EditorSubprocess,
  EditorTimerEvent,
} from '../../model/editormodel';
import { ModelWrapper } from '../../model/modelwrapper';
import { ProvisionSelection } from '../../model/provisionImport';
import { DataType } from '../../serialize/interface/baseinterface';
import {
  DeletableNodeTypes,
  EditableNodeTypes,
  EditAction,
} from '../../utils/constants';
import QuickEditApproval from '../quickedit/approval';
import QuickEditEGate from '../quickedit/egate';
import QuickEditEnd from '../quickedit/end';
import QuickEditProcess from '../quickedit/process';
import QuickEditSignalEvent from '../quickedit/signalevent';
import QuickEditTimer from '../quickedit/timer';

const NODE_EDIT_VIEWS: Record<
  DeletableNodeTypes,
  React.FC<{
    node: EditorNode;
    modelWrapper: ModelWrapper;
    setModel: (m: EditorModel) => void;
    setDialog: (
      nodeType: EditableNodeTypes | DeletableNodeTypes,
      action: EditAction,
      id: string
    ) => void;
    page: EditorSubprocess;
    provision?: ProvisionSelection;
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
};

const QuickEdit: React.FC<{
  node: EditorNode;
  modelWrapper: ModelWrapper;
  setModel: (m: EditorModel) => void;
  setDialog: (
    nodeType: EditableNodeTypes | DeletableNodeTypes,
    action: EditAction,
    id: string
  ) => void;
  page: EditorSubprocess;
  provision?: ProvisionSelection;
}> = function (props) {
  const { node } = props;
  const Edit = NODE_EDIT_VIEWS[node.datatype as DeletableNodeTypes];
  return <Edit {...props} />;
};

export default QuickEdit;
