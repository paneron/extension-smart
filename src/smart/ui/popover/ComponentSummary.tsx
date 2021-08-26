/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { jsx } from '@emotion/react';
import React from 'react';
import { popover_panel_container } from '../../../css/layout';

import { EditorApproval, EditorDataClass, EditorEGate, EditorModel, EditorNode, EditorProcess, EditorRegistry, EditorSignalEvent, EditorTimerEvent, getEditorDataClassById } from "../../model/editormodel";
import { DataType } from '../../serialize/interface/baseinterface';
import { DescribableNodeTypes } from '../../utils/constants';
import { DescribeDC, DescribeRegistry } from '../common/description/ComponentDescription';
import ApprovalSummary from './components/ApprovalSummary';
import EGateSummary from './components/EGateSummary';
import { SignalSummary, TimerSummary } from './components/EventSummary';
import ProcessSummary from './components/ProcessSummary';

const ComponentSummary:React.FC<{
  id: string;
  model: EditorModel;
}> = function ({id, model}) {
  const elm = model.elements[id];
  const View = Describe_Node_Details[elm.datatype as DescribableNodeTypes];
  return (
    <div css={popover_panel_container}>  
      <View node={elm} model={model} />
    </div>
  );
}

const Describe_Node_Details: Record<DescribableNodeTypes, React.FC<{
  node: EditorNode;
  model: EditorModel;
}>> = {
  [DataType.PROCESS] : 
    function ({ node, model }) {
      return <ProcessSummary process={node as EditorProcess} model={model} />
    },
  [DataType.APPROVAL] :
    function ({ node }) {
      return <ApprovalSummary approval={node as EditorApproval} />
    },
  [DataType.TIMEREVENT] :
    function ({ node }) {
      return <TimerSummary timer={node as EditorTimerEvent} />
    },
  [DataType.SIGNALCATCHEVENT] :
    function ({ node }) {
      return <SignalSummary signal={node as EditorSignalEvent} />
    },
  [DataType.DATACLASS] :
    function ({ node }) {
      return <DescribeDC dc={node as EditorDataClass} />
    },
  [DataType.REGISTRY] :
    function ({node, model}) {
      return <DescribeRegistry reg={node as EditorRegistry} getDataClassById={id => getEditorDataClassById(model, id)} />
    },
  [DataType.EGATE] :
    function ({ node }) {
      return <EGateSummary egate={node as EditorEGate} />
    }
}

export default ComponentSummary;