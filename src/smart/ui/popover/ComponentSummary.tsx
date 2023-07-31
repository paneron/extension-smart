import React from 'react';
import { popoverPanelContainer } from '@/css/layout';

import {
  EditorApproval,
  EditorDataClass,
  EditorEGate,
  EditorModel,
  EditorNode,
  EditorProcess,
  EditorRegistry,
  EditorSignalEvent,
  EditorTimerEvent,
  getEditorDataClassById,
} from '@/smart/model/editormodel';
import { DataType } from '@paneron/libmmel/interface/baseinterface';
import { DescribableNodeTypes } from '@/smart/utils/constants';
import { DescribeDC, DescribeRegistry } from '@/smart/ui/common/description/data';
import ApprovalSummary from '@/smart/ui/popover/components/ApprovalSummary';
import EGateSummary from '@/smart/ui/popover/components/EGateSummary';
import { SignalSummary, TimerSummary } from '@/smart/ui/popover/components/EventSummary';
import ProcessSummary from '@/smart/ui/popover/components/ProcessSummary';

const ComponentSummary: React.FC<{
  id: string;
  model: EditorModel;
}> = function ({ id, model }) {
  const elm = model.elements[id];
  const View = Describe_Node_Details[elm.datatype as DescribableNodeTypes];
  return (
    <div style={popoverPanelContainer}>
      <View node={elm} model={model} />
    </div>
  );
};

interface Props {
    node: EditorNode;
    model: EditorModel;
  }

const Describe_Node_Details: Record<
  DescribableNodeTypes,
  React.FC<Props>
> = {
  [DataType.PROCESS] : function ({ node, model }: Props) {
    return <ProcessSummary process={node as EditorProcess} model={model} />;
  },
  [DataType.APPROVAL] : function ({ node }: Props) {
    return <ApprovalSummary approval={node as EditorApproval} />;
  },
  [DataType.TIMEREVENT] : function ({ node }: Props) {
    return <TimerSummary timer={node as EditorTimerEvent} />;
  },
  [DataType.SIGNALCATCHEVENT] : function ({ node }: Props) {
    return <SignalSummary signal={node as EditorSignalEvent} />;
  },
  [DataType.DATACLASS] : function ({ node }: Props) {
    return <DescribeDC dc={node as EditorDataClass} />;
  },
  [DataType.REGISTRY] : function ({ node, model }: Props) {
    return (
      <DescribeRegistry
        reg={node as EditorRegistry}
        getDataClassById={id => getEditorDataClassById(model, id)}
      />
    );
  },
  [DataType.EGATE] : function ({ node }: Props) {
    return <EGateSummary egate={node as EditorEGate} />;
  },
};

export default ComponentSummary;
