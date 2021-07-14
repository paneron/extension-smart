import { MMELNode } from '../serialize/interface/baseinterface';
import {
  MMELRegistry,
  MMELDataClass,
  MMELEnum,
} from '../serialize/interface/datainterface';
import {
  MMELEdge,
  MMELSubprocess,
} from '../serialize/interface/flowcontrolinterface';
import { MMELModel, MMELObjectMaps } from '../serialize/interface/model';
import {
  MMELRole,
  MMELReference,
  MMELProvision,
  MMELVariable,
} from '../serialize/interface/supportinterface';

export const TimerType: Array<string> = ['', 'WAIT', 'REPEAT'];
export const MODAILITYOPTIONS: Array<string> = [
  '',
  'MUST',
  'SHALL',
  'SHOULD',
  'CAN',
  'MAY',
];
export const EMPTYTYPE = '';
export const STRINGTYPE = 'string';
export const BOOLEANTYPE = 'boolean';
export const DATETIMETYPE = 'datetime';
export const ROLETYPE = 'role';
export const DATATYPE: Array<string> = [
  EMPTYTYPE,
  STRINGTYPE,
  BOOLEANTYPE,
  DATETIMETYPE,
  ROLETYPE,
];

export const BOOLEANOPTIONS = ['', 'True', 'False'];

export enum VarType {
  DATA = 'DATAITEM',
  LISTDATA = 'DATALIST',
  DERIVED = 'DERIVED',
}

export const VAR_TYPES = [VarType.DATA, VarType.LISTDATA, VarType.DERIVED];

export class IDManager implements MMELObjectMaps {
  roles = new Map<string, MMELRole>(); // Roles
  regs = new Map<string, MMELRegistry>(); // Registry
  nodes = new Map<string, MMELNode>(); // Registry, Dataclass, events, process, approval, gateway
  refs = new Map<string, MMELReference>(); // reference
  pages = new Map<string, MMELSubprocess>(); // subprocess
  provisions = new Map<string, MMELProvision>(); // provisions
  dcs = new Map<string, MMELDataClass>(); // dataclass
  edges = new Map<string, MMELEdge>();
  enums = new Map<string, MMELEnum>();
  vars = new Map<string, MMELVariable>();

  constructor(m: MMELModel) {
    for (const r of m.roles) {
      this.roles.set(r.id, r);
    }
    for (const r of m.regs) {
      this.regs.set(r.id, r);
      this.nodes.set(r.id, r);
    }
    for (const r of m.refs) {
      this.refs.set(r.id, r);
    }
    for (const p of m.pages) {
      this.pages.set(p.id, p);
      for (const e of p.edges) {
        this.edges.set(e.id, e);
      }
    }
    for (const p of m.provisions) {
      this.provisions.set(p.id, p);
    }
    for (const d of m.dataclasses) {
      this.dcs.set(d.id, d);
      this.nodes.set(d.id, d);
    }
    for (const e of m.events) {
      this.nodes.set(e.id, e);
    }
    for (const g of m.gateways) {
      this.nodes.set(g.id, g);
    }
    for (const p of m.processes) {
      this.nodes.set(p.id, p);
    }
    for (const p of m.approvals) {
      this.nodes.set(p.id, p);
    }
    for (const en of m.enums) {
      this.enums.set(en.id, en);
    }
    for (const v of m.vars) {
      this.vars.set(v.id, v);
    }
  }

  findUniqueID(prefix: string) {
    let num = 0;
    while (this.nodes.has(prefix + num)) {
      num++;
    }
    return prefix + num;
  }

  findProvisionID(prefix: string) {
    let num = 0;
    while (this.provisions.has(prefix + num)) {
      num++;
    }
    return prefix + num;
  }

  findUniqueEdgeID(prefix: string) {
    let num = 0;
    while (this.edges.has(prefix + num)) {
      num++;
    }
    return prefix + num;
  }

  findUniquePageID(prefix: string) {
    let num = 0;
    while (this.pages.has(prefix + num)) {
      num++;
    }
    return prefix + num;
  }

  findUniqueRefID(prefix: string) {
    let num = 0;
    while (this.refs.has(prefix + num)) {
      num++;
    }
    return prefix + num;
  }
}
