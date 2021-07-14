import { MMELNode } from './baseinterface';
import {
  MMELDataClass,
  MMELEnum,
  MMELRegistry,
  ParsingDataClass,
  ParsingRegistry,
} from './datainterface';
import { MMELEventNode } from './eventinterface';
import {
  MMELGateway,
  MMELSubprocess,
  ParsingSubprocess,
} from './flowcontrolinterface';
import {
  MMELApproval,
  MMELProcess,
  ParsingApproval,
  ParsingProcess,
} from './processinterface';
import {
  MMELMetadata,
  MMELProvision,
  MMELReference,
  MMELRole,
  MMELVariable,
  ParsingProvision,
} from './supportinterface';

export interface MMELModel {
  meta: MMELMetadata;
  roles: Array<MMELRole>;
  provisions: Array<MMELProvision>;
  pages: Array<MMELSubprocess>;
  processes: Array<MMELProcess>;
  dataclasses: Array<MMELDataClass>;
  regs: Array<MMELRegistry>;
  events: Array<MMELEventNode>;
  gateways: Array<MMELGateway>;
  refs: Array<MMELReference>;
  approvals: Array<MMELApproval>;
  enums: Array<MMELEnum>;
  vars: Array<MMELVariable>;

  root: MMELSubprocess | null;
}

export interface ParsingModel {
  content: MMELModel;
  maps: MMELObjectMaps;
  p_root: string;
  p_provisions: Array<ParsingProvision>;
  p_pages: Array<ParsingSubprocess>;
  p_processes: Array<ParsingProcess>;
  p_dataclasses: Array<ParsingDataClass>;
  p_regs: Array<ParsingRegistry>;
  p_approvals: Array<ParsingApproval>;
}

export interface MMELObjectMaps {
  roles: Map<string, MMELRole>;
  regs: Map<string, MMELRegistry>;
  nodes: Map<string, MMELNode>;
  refs: Map<string, MMELReference>;
  pages: Map<string, MMELSubprocess>;
  provisions: Map<string, MMELProvision>;
  dcs: Map<string, MMELDataClass>;
}
