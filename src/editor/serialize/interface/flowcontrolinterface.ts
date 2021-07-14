import { MMELNode, MMELObject } from './baseinterface';

export interface MMELEdge extends MMELObject {
  id: string;
  from: MMELSubprocessComponent | null;
  to: MMELSubprocessComponent | null;
  description: string;
  condition: string;
}

export interface ParsingEdge {
  content: MMELEdge;
  p_from: string;
  p_to: string;
}

export interface MMELSubprocess extends MMELObject {
  id: string;
  childs: Array<MMELSubprocessComponent>;
  edges: Array<MMELEdge>;
  data: Array<MMELSubprocessComponent>;
}

export interface ParsingSubprocess {
  content: MMELSubprocess;
  p_childs: Array<ParsingSubprocessComponent>;
  p_edges: Array<ParsingEdge>;
  p_data: Array<ParsingSubprocessComponent>;
  map: Map<string, MMELSubprocessComponent>;
}

export interface MMELSubprocessComponent extends MMELObject {
  element: MMELNode | null;
  x: number;
  y: number;
}

export interface ParsingSubprocessComponent {
  content: MMELSubprocessComponent;
  p_element: string;
}

export type MMELGateway = MMELNode;

export interface MMELEGate extends MMELGateway {
  label: string;
}
