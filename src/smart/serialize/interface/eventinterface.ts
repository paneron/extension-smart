import { DataType, MMELNode } from './baseinterface';

export type MMELEventNode = MMELNode;

export type MMELEndEvent = MMELEventNode;

export interface MMELSignalCatchEvent extends MMELEventNode {
  signal: string;
  datatype: DataType.SIGNALCATCHEVENT;
}

export interface MMELStartEvent extends MMELEventNode {
  datatype: DataType.STARTEVENT;
}

export interface MMELTimerEvent extends MMELEventNode {
  type: string;
  para: string;
  datatype: DataType.TIMEREVENT;
}
