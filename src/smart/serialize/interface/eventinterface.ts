import { MMELNode } from './baseinterface';

export type MMELEventNode = MMELNode;

export type MMELEndEvent = MMELEventNode;

export interface MMELSignalCatchEvent extends MMELEventNode {
  signal: string;
}

export type MMELStartEvent = MMELEventNode;

export interface MMELTimerEvent extends MMELEventNode {
  type: string;
  para: string;
}
