import { MMELNode, MMELObject } from './baseinterface';

export interface MMELSubprocessComponent extends MMELObject {
  element: string;
  x: number;
  y: number;
}

export interface MMELEdge extends MMELObject {
  id: string;
  from: string;
  to: string;
  description: string;
  condition: string;
}

export interface MMELSubprocess extends MMELObject {
  id: string;
  childs: Record<string, MMELSubprocessComponent>;
  edges: Record<string, MMELEdge>;
  data: Record<string, MMELSubprocessComponent>;
}

export type MMELGateway = MMELNode;

export interface MMELEGate extends MMELGateway {
  label: string;
}
