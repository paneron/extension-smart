/**
 * Perform basic validation on the parsed model
 */

import { DataType, MMELNode, MMELObject } from '@/interface/baseinterface';
import {
  MMELDataAttribute,
  MMELDataClass,
  MMELRegistry,
} from '@/interface/datainterface';
import {
  MMELEndEvent,
  MMELSignalCatchEvent,
  MMELStartEvent,
  MMELTimerEvent,
} from '@/interface/eventinterface';
import {
  MMELEdge,
  MMELEGate,
  MMELSubprocess,
  MMELSubprocessComponent,
} from '@/interface/flowcontrolinterface';
import { MMELModel } from '@/interface/model';
import { MMELApproval, MMELProcess } from '@/interface/processinterface';
import {
  MMELProvision,
  MMELReference,
  MMELRole,
  MMELVariable,
  MMELView,
} from '@/interface/supportinterface';

function validateAttribute(
  attribute: MMELDataAttribute,
  refs: Record<string, MMELReference>
): void {
  for (const x in attribute.ref) {
    if (x === '' || refs[x] === undefined) {
      throw new Error(
        `Error in resolving IDs in 'reference' for data attributes '${attribute.id}'`
      );
    }
  }
}

function validateDataClass(
  dc: MMELDataClass,
  refs: Record<string, MMELReference>
): void {
  for (const x in dc.attributes) {
    validateAttribute(dc.attributes[x], refs);
  }
}

function validateRegistry(
  reg: MMELRegistry,
  nodes: Record<string, MMELNode>
): void {
  if (reg.data === '' || !isDataClass(nodes[reg.data])) {
    throw new Error(
      `Error in resolving IDs in 'data class' for registry '${reg.id}'`
    );
  }
}

function validateEdge(
  edge: MMELEdge,
  elements: Record<string, MMELSubprocessComponent>
): void {
  if (edge.from === '' || elements[edge.from] === undefined) {
    throw new Error(`Error in resolving IDs in 'from' for edge '${edge.id}'`);
  }
  if (edge.to === '' || elements[edge.to] === undefined) {
    throw new Error(`Error in resolving IDs in 'to' for edge '${edge.id}'`);
  }
}

function validateSubprocess(
  com: MMELSubprocess,
  nodes: Record<string, MMELNode>
): void {
  for (const x in com.childs) {
    validateSubprocessComponent(com.childs[x], nodes);
  }
  for (const x in com.data) {
    validateSubprocessComponent(com.data[x], nodes);
  }
  for (const e in com.edges) {
    validateEdge(com.edges[e], com.childs);
  }
}

function validateSubprocessComponent(
  com: MMELSubprocessComponent,
  nodes: Record<string, MMELNode>
): void {
  if (com.element === '' || nodes[com.element] === undefined) {
    throw new Error(
      `Error in resolving IDs in 'from' for graph node ${com.element}`
    );
  }
}

function validateApproval(
  app: MMELApproval,
  roles: Record<string, MMELRole>,
  refs: Record<string, MMELReference>,
  nodes: Record<string, MMELNode>
): void {
  if (app.actor !== '' && roles[app.actor] === undefined) {
    throw new Error(
      `Error in resolving IDs in 'actor' for process '${app.id}'`
    );
  }
  if (app.approver !== '' && roles[app.approver] === undefined) {
    throw new Error(
      `Error in resolving IDs in 'approver' for process '${app.id}'`
    );
  }
  for (const x in app.records) {
    if (nodes[x] === undefined || !isRegistry(nodes[x])) {
      throw new Error(
        `Error in resolving IDs in 'approval record' for process '${app.id}'`
      );
    }
  }
  for (const x in app.ref) {
    if (refs[x] === undefined) {
      throw new Error(
        `Error in resolving IDs in 'input' for process '${app.id}'`
      );
    }
  }
}

function validateProcess(
  p: MMELProcess,
  nodes: Record<string, MMELNode>,
  provisions: Record<string, MMELProvision>,
  roles: Record<string, MMELRole>,
  pages: Record<string, MMELSubprocess>
): void {
  for (const x in p.output) {
    if (nodes[x] === undefined || !isRegistry(nodes[x])) {
      throw new Error(
        `Error in resolving IDs in 'output' for process '${p.id}'`
      );
    }
  }
  for (const x in p.input) {
    if (nodes[x] === undefined || !isRegistry(nodes[x])) {
      throw new Error(
        `Error in resolving IDs in 'input' for process '${p.id}'`
      );
    }
  }
  for (const x in p.provision) {
    if (provisions[x] === undefined) {
      throw new Error(
        `Error in resolving IDs in 'provision' for process '${p.id}'`
      );
    }
  }
  if (p.actor !== '' && roles[p.actor] === undefined) {
    throw new Error(
      `Error in resolving IDs in 'actor' ${p.actor} for process ${p.id}`
    );
  }
  if (p.page !== '' && pages[p.page] === undefined) {
    throw new Error(
      `Error in resolving IDs in 'subprocess' for process '${p.id}'`
    );
  }
}

function validateProvision(
  pro: MMELProvision,
  refs: Record<string, MMELReference>
): void {
  for (const x in pro.ref) {
    if (refs[x] === undefined) {
      throw new Error(
        `Error in resolving IDs in 'reference' for provision ${pro.id}`
      );
    }
  }
}

function validateView(view: MMELView, vars: Record<string, MMELVariable>) {
  for (const x in view.profile) {
    if (vars[x] === undefined) {
      throw new Error(`Error in resolving variable IDs in view ${view.id}`);
    }
  }
}

export function validateModel(model: MMELModel): void {
  if (model.root === '' || model.pages[model.root] === undefined) {
    throw Error('Root element not found');
  }
  for (const p in model.pages) {
    validateSubprocess(model.pages[p], model.elements);
  }
  for (const p in model.provisions) {
    validateProvision(model.provisions[p], model.refs);
  }
  for (const p in model.elements) {
    const node = model.elements[p];
    if (isApproval(node)) {
      validateApproval(node, model.roles, model.refs, model.elements);
    } else if (isRegistry(node)) {
      validateRegistry(node, model.elements);
    } else if (isDataClass(node)) {
      validateDataClass(node, model.refs);
    } else if (isProcess(node)) {
      validateProcess(
        node,
        model.elements,
        model.provisions,
        model.roles,
        model.pages
      );
    }
  }
  for (const v in model.views) {
    validateView(model.views[v], model.vars);
  }
}

export function isPage(x: MMELObject): x is MMELSubprocess {
  return x.datatype === DataType.SUBPROCESS;
}

export function isProcess(x: MMELNode): x is MMELProcess {
  return x.datatype === DataType.PROCESS;
}

export function isDataClass(x: MMELNode): x is MMELDataClass {
  return x.datatype === DataType.DATACLASS;
}

export function isRegistry(x: MMELNode): x is MMELRegistry {
  return x.datatype === DataType.REGISTRY;
}

export function isApproval(x: MMELNode): x is MMELApproval {
  return x.datatype === DataType.APPROVAL;
}

export function isEndEvent(x: MMELNode): x is MMELEndEvent {
  return x.datatype === DataType.ENDEVENT;
}

export function isStartEvent(x: MMELNode): x is MMELStartEvent {
  return x.datatype === DataType.STARTEVENT;
}

export function isTimerEvent(x: MMELNode): x is MMELTimerEvent {
  return x.datatype === DataType.TIMEREVENT;
}

export function isSignalEvent(x: MMELNode): x is MMELSignalCatchEvent {
  return x.datatype === DataType.SIGNALCATCHEVENT;
}

export function isEGate(x: MMELNode): x is MMELEGate {
  return x.datatype === DataType.EGATE;
}
