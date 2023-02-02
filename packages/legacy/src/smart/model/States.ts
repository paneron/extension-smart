import React from 'react';
import { NodeProps } from 'react-flow-renderer';
import { HistoryItem, PageHistory } from './history';
import { ModelWrapper } from './modelwrapper';
import { DataType } from '@paneron/libmmel/interface/baseinterface';
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
import { EditorModel, ModelType } from './editormodel';
import { MMELDocument } from './document';

export interface FunModel {
  mw: ModelWrapper;
  history: PageHistory;
}

/**
 * This one should be deprecated, but is still used somewhere
 */
export interface EditorState {
  history: HistoryItem[];
  page: string;
  model: EditorModel;
  type: 'model';
}

/**
 * The view options in editor
 */
export interface EditorViewOption {
  dvisible: boolean; // visibility of data nodes
  edgeDeleteVisible: boolean; // visibility of the remove edge buttons
  idVisible: boolean; // visibility of element ID
  commentVisible: boolean; // visibility of comment functions
}

export interface ViewerOption {
  dvisible: boolean; // visibility of data nodes
  idVisible: boolean;
  repoBCVisible: boolean;
}

export interface MapperViewOption {
  dataVisible: boolean; // visibility of data nodes
  legVisible: boolean; // visibility of legends
  docVisible: boolean; // visibility of document templates
  mapAIVisible: boolean; // visibility of mapping import calculation pane
  repoMapVisible: boolean; // visibility of the small repo map
  repoLegendVisible: boolean; // visibility of the legend in the small repo map
  idVisible: boolean;
}

export type ReferenceContent = ModelWrapper | MMELDocument;

export interface MapperState {
  history: PageHistory;
  modelWrapper: ReferenceContent;
  modelType: ModelType;
  historyMap: Record<string, PageHistory>;
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
  return x.type === 'model';
}

export const MMELtoFlowEntries: Record<string, MMELtoFlowEntry> = {
  [DataType.STARTEVENT]       : { flowName : 'start', component : StartComponent },
  [DataType.ENDEVENT]         : { flowName : 'end', component : EndComponent },
  [DataType.TIMEREVENT]       : { flowName : 'timer', component : TimerComponent },
  [DataType.EGATE]            : { flowName : 'egate', component : EgateComponent },
  [DataType.SIGNALCATCHEVENT] : {
    flowName  : 'signal',
    component : SignalCatchComponent,
  },
  [DataType.PROCESS]   : { flowName : 'process', component : ProcessComponent },
  [DataType.APPROVAL]  : { flowName : 'approval', component : ApprovalComponent },
  [DataType.DATACLASS] : { flowName : 'data', component : Datacube },
  [DataType.REGISTRY]  : { flowName : 'data', component : Datacube },
};

export const NodeTypes = gatherNodeTypes(MMELtoFlowEntries);

export const EdgeTypes = {
  self     : SelfLoopEdge,
  normal   : NormalEdge,
  datalink : DataLinkEdge,
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
