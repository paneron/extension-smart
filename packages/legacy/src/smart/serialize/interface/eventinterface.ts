import { DataType, MMELNode } from './baseinterface';

export type MMELEventNode = MMELNode;

export type MMELEndEvent = MMELEventNode;

export interface MMELSignalCatchEvent extends MMELEventNode {
  id: string;
  signal: string;
  datatype: DataType.SIGNALCATCHEVENT;
}

export interface MMELStartEvent extends MMELEventNode {
  id: string;
  datatype: DataType.STARTEVENT;
}

export interface MMELTimerEvent extends MMELEventNode {
  id: string;
  type: string;
  para: string;
  datatype: DataType.TIMEREVENT;
}
