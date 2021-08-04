import { MMELNode } from './baseinterface';

export interface MMELApproval extends MMELNode {
  name: string;
  modality: string;
  actor: string;
  approver: string;
  records: Set<string>;
  ref: Set<string>;
}

export interface MMELProcess extends MMELNode {
  name: string;
  modality: string;
  actor: string;
  output: Set<string>;
  input: Set<string>;
  provision: Set<string>;
  page: string;
  measure: Array<string>;
}
