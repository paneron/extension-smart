import { OnLoadParams } from 'react-flow-renderer';
import { Registry } from '../../model/model/data/registry';
import { SignalCatchEvent } from '../../model/model/event/signalcatchevent';
import { TimerEvent } from '../../model/model/event/timerevent';
import { SubprocessComponent } from '../../model/model/flow/subprocess';
import { EGate } from '../../model/model/gate/egate';
import { Model } from '../../model/model/model';
import { Approval } from '../../model/model/process/approval';
import { Process } from '../../model/model/process/process';
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
  history: PageHistory;
  modelWrapper: ModelWrapper;
  rfInstance: OnLoadParams | null;
  datarepo: Registry | null; // whether the data repository view is on and which registry is specified
  datastore: DocumentStore;
  viewprocess: IProcess | null;
  process: Process | null; // process to be edited
  viewapproval: IApproval | null;
  approval: Approval | null; // approval to be edited
  viewTimer: ITimer | null;
  timer: TimerEvent | null; // Timer to be edited
  viewSignalEvent: ISignalCatchEvent | null;
  scEvent: SignalCatchEvent | null; // Signal Catch Event to be edited
  viewEGate: IEGate | null;
  eGate: EGate | null; // Exclusive Gateway to be edited
  addingexisting: string;
  simulation: SubprocessComponent | null;
  imodel: Model;
  namespace: string;
  importing: string;
  mtestResult: Map<string, MeasureRType> | null; // the result of the measurement test
  mtestValues: Map<string, string>; // measurement data
}

export interface StateMan {
  state: IState;
  setState: (s: IState) => void;
}

export interface ISearch {
  document: string;
  clause: string;
  actor: string;
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
