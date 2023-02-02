import { DataType, MMELNode, MMELObject } from './baseinterface';

export interface MMELSubprocessComponent extends MMELObject {
  element: string;
  x: number;
  y: number;
  datatype: DataType.SUBPROCESSCOMPONENT;
}

export interface MMELEdge extends MMELObject {
  id: string;
  from: string;
  to: string;
  description: string;
  condition: string;
  datatype: DataType.EDGE;
}

export interface MMELSubprocess extends MMELObject {
  id: string;
  childs: Record<string, MMELSubprocessComponent>;
  edges: Record<string, MMELEdge>;
  data: Record<string, MMELSubprocessComponent>;
  datatype: DataType.SUBPROCESS;
}

export interface MMELEGate extends MMELNode {
  label: string;
  datatype: DataType.EGATE;
}
