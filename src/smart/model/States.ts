import React from 'react';
import { NodeProps } from 'react-flow-renderer';
import { PageHistory } from './history';
import { ModelWrapper } from './modelwrapper';
import { DataType } from '../serialize/interface/baseinterface';
import { DataLinkEdge, NormalEdge, SelfLoopEdge } from '../ui/flowui/edgeUI';
import {
  ApprovalComponent,
  Datacube,
  EgateComponent,
  EndComponent,
  ProcessComponent,
  SignalCatchComponent,
  StartComponent,
  TimerComponent,
} from '../ui/flowui/nodeUI';
import { ModelType } from './editormodel';
import { SMARTWorkspace } from './workspace';
import { MMELDocument } from './document';

export interface EditorState {
  dvisible: boolean; // visibility of data nodes
  edgeDeleteVisible: boolean; // visibility of the remove edge buttons
  history: PageHistory;
  modelWrapper: ModelWrapper;
}

export interface ViewerState {
  dvisible: boolean; // visibility of data nodes
  history: PageHistory;
  modelWrapper: ModelWrapper;
}

export interface MapperViewOption {
  dataVisible: boolean; // visibility of data nodes
  legVisible: boolean; // visibility of legends
  docVisible: boolean; // visibility of document templates
  mapAIVisible: boolean; // visibility of mapping import calculation pane
}

export type ReferenceContent = ModelWrapper | MMELDocument;

export interface MapperState {
  history: PageHistory;
  modelWrapper: ReferenceContent;
  modelType: ModelType;
  historyMap: Record<string, PageHistory>;
}

export interface ActionState {
  dvisible: boolean; // visibility of data nodes
  history: PageHistory;
  modelWrapper: ModelWrapper;
  workspace: SMARTWorkspace;
}

export interface MapperSelectedInterface {
  modelType: ModelType;
  selected: string;
}

export interface MMELtoFlowEntry {
  flowName: string;
  component: React.FC<NodeProps>;
}

export interface LegendInterface {
  label: string;
  color: string;
}

export function isModelWrapper(x: ReferenceContent): x is ModelWrapper {
  return x.type === 'modelwrapper';
}

export const MMELtoFlowEntries: Record<string, MMELtoFlowEntry> = {
  [DataType.STARTEVENT]: { flowName: 'start', component: StartComponent },
  [DataType.ENDEVENT]: { flowName: 'end', component: EndComponent },
  [DataType.TIMEREVENT]: { flowName: 'timer', component: TimerComponent },
  [DataType.EGATE]: { flowName: 'egate', component: EgateComponent },
  [DataType.SIGNALCATCHEVENT]: {
    flowName: 'signal',
    component: SignalCatchComponent,
  },
  [DataType.PROCESS]: { flowName: 'process', component: ProcessComponent },
  [DataType.APPROVAL]: { flowName: 'approval', component: ApprovalComponent },
  [DataType.DATACLASS]: { flowName: 'data', component: Datacube },
  [DataType.REGISTRY]: { flowName: 'data', component: Datacube },
};

export const NodeTypes = gatherNodeTypes(MMELtoFlowEntries);

export const EdgeTypes = {
  self: SelfLoopEdge,
  normal: NormalEdge,
  datalink: DataLinkEdge,
};

function gatherNodeTypes(
  entries: Record<number, MMELtoFlowEntry>
): Record<string, React.FC<NodeProps>> {
  const obj: Record<string, React.FC<NodeProps>> = {};
  for (const x in entries) {
    const record = entries[x];
    obj[record.flowName] = record.component;
  }
  return obj;
}
