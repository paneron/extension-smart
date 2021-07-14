import { MMELNode } from './baseinterface';
import { MMELRegistry } from './datainterface';
import { MMELSubprocess } from './flowcontrolinterface';
import { MMELProvision, MMELReference, MMELRole } from './supportinterface';

export interface MMELApproval extends MMELNode {
  name: string;
  modality: string;
  actor: MMELRole | null;
  approver: MMELRole | null;
  records: Array<MMELRegistry>;
  ref: Array<MMELReference>;
}

export interface ParsingApproval {
  content: MMELApproval;
  p_actor: string;
  p_approver: string;
  p_records: Array<string>;
  p_ref: Array<string>;
}

export interface MMELProcess extends MMELNode {
  name: string;
  modality: string;
  actor: MMELRole | null;
  output: Array<MMELRegistry>;
  input: Array<MMELRegistry>;
  provision: Array<MMELProvision>;
  page: MMELSubprocess | null;
  measure: Array<string>;
}

export interface ParsingProcess {
  content: MMELProcess;
  p_actor: string;
  p_page: string;
  p_output: Array<string>;
  p_provision: Array<string>;
  p_input: Array<string>;
}
