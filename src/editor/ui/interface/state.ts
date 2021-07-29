import { OnLoadParams } from 'react-flow-renderer';
import { DocumentStore } from '../../repository/document';
import NormalEdge from '../component/unit/normaledge';
import SelfLoopEdge from '../component/unit/selfloopedge';
import { PageHistory } from '../model/history';
import { MeasureRType } from '../model/measure/measureChecker';
import { ModelWrapper } from '../model/modelwrapper';
import {
  IApproval,
  IEGate,
  IProcess,
  ISignalCatchEvent,
  ITimer,
} from './datainterface';
import * as deco from '../util/decorator';
import { MMELModel } from '../../serialize/interface/model';
import { MMELRegistry } from '../../serialize/interface/datainterface';
import {
  MMELEGate,
  MMELSubprocessComponent,
} from '../../serialize/interface/flowcontrolinterface';
import {
  MMELSignalCatchEvent,
  MMELTimerEvent,
} from '../../serialize/interface/eventinterface';
import {
  MMELApproval,
  MMELProcess,
} from '../../serialize/interface/processinterface';
import { MMELNode } from '../../serialize/interface/baseinterface';

export interface IState {
  cvisible: boolean; // visibility of the control panel
  dvisible: boolean; // visibility of data nodes
  nvisible: boolean; // visibiilty of new component pane
  svisible: boolean; // visibility of the basic setting pane
  clvisible: boolean; // visibility of the check list feature
  fpvisible: boolean; // visibility of the filter pane
  aivisible: boolean; // visibility of the AI setting pane
  importvisible: boolean; // visibiilty of the import pane
  edgeDeleteVisible: boolean; // visibility of the remove edge buttons
  onepage: boolean; // visitibility of the one-page checklist
  measureVisible: boolean; // visibility of the measurement checking page
  searchvisible: boolean; // visibility of the search mechanism
  history: PageHistory;
  modelWrapper: ModelWrapper;
  rfInstance: OnLoadParams | null;
  datarepo: MMELRegistry | null; // whether the data repository view is on and which registry is specified
  datastore: DocumentStore;
  viewprocess: IProcess | null;
  process: MMELProcess | null; // process to be edited
  viewapproval: IApproval | null;
  approval: MMELApproval | null; // approval to be edited
  viewTimer: ITimer | null;
  timer: MMELTimerEvent | null; // Timer to be edited
  viewSignalEvent: ISignalCatchEvent | null;
  scEvent: MMELSignalCatchEvent | null; // Signal Catch Event to be edited
  viewEGate: IEGate | null;
  eGate: MMELEGate | null; // Exclusive Gateway to be edited
  addingexisting: string;
  simulation: MMELSubprocessComponent | null;
  imodel: MMELModel;
  namespace: string;
  importing: string;
  mtestResult: Map<string, MeasureRType> | null; // the result of the measurement test
  mtestValues: Map<string, string>; // measurement data
  highlight: MMELNode | null;
}

export interface StateMan {
  state: IState;
  setState: (s: IState) => void;
}

export interface ISearch {
  document: string;
  clause: string;
  actor: string;
  modality: boolean[];
}

export interface SearchMan {
  searchState: ISearch;
  setSearchState: (s: ISearch) => void;
}

export const nodeTypes = {
  start: deco.startComponent,
  end: deco.endComponent,
  timer: deco.timerComponent,
  egate: deco.egateComponent,
  signalcatch: deco.signalcatchComponent,
  process: deco.processComponent,
  approval: deco.approvalComponent,
  data: deco.datacube,
};

export const edgeTypes = {
  self: SelfLoopEdge,
  normal: NormalEdge,
};
