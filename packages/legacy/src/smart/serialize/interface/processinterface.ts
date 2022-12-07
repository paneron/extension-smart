import { DataType, MMELNode } from './baseinterface';

export interface MMELApproval extends MMELNode {
  id: string;
  name: string;
  modality: string;
  actor: string;
  approver: string;
  records: Set<string>;
  ref: Set<string>;
  datatype: DataType.APPROVAL;
}

export interface MMELProcess extends MMELNode {
  id: string;
  name: string;
  modality: string;
  actor: string;
  output: Set<string>;
  input: Set<string>;
  provision: Set<string>;
  links: Set<string>;
  notes: Set<string>;
  tables: Set<string>;
  figures: Set<string>;
  comments: Set<string>;
  page: string;
  measure: string[];
  datatype: DataType.PROCESS;
}
