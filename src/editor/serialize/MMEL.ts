import {
  parseMetaData,
  parseProvision,
  parseReference,
  parseRole,
  parseVariable,
  resolveProvision,
} from './handler/supporthandler';
import { MMELNode } from './interface/baseinterface';
import { MMELDataClass, MMELRegistry } from './interface/datainterface';
import { MMELSubprocess } from './interface/flowcontrolinterface';
import { MMELModel, MMELObjectMaps, ParsingModel } from './interface/model';
import { MMELtokenize } from './util/tokenizer';
import {
  MMELReference,
  MMELRole,
  MMELProvision,
} from './interface/supportinterface';
import {
  parseApproval,
  parseProcess,
  resolveApproval,
  resolveProcess,
} from './handler/processhandler';
import {
  parseDataClass,
  parseEnum,
  parseRegistry,
  resolveDataClass,
  resolveRegistry,
} from './handler/datahandler';
import {
  parseEndEvent,
  parseSignalCatchEvent,
  parseStartEvent,
  parseTimerEvent,
} from './handler/eventhandler';
import {
  parseEGate,
  parseSubprocess,
  resolveSubprocess,
} from './handler/flowcontrolhandler';
import { toMMELModel } from './util/serailizeformater';

// the function to convert text to MMEL
export function textToMMEL(x: string): MMELModel {
  const pm = parseModel(x);
  return resolveModel(pm);
}

// the function to convert MMEL to text
export function MMELToText(model: MMELModel): string {
  let out = '';
  if (model.root !== null) {
    out += 'root ' + model.root.id + '\n\n';
  }
  out += toMMELModel(model.meta) + '\n';
  for (const r of model.roles) {
    out += toMMELModel(r) + '\n';
  }
  for (const p of model.processes) {
    out += toMMELModel(p) + '\n';
  }
  for (const r of model.provisions) {
    out += toMMELModel(r) + '\n';
  }
  for (const a of model.approvals) {
    out += toMMELModel(a) + '\n';
  }
  for (const e of model.events) {
    out += toMMELModel(e) + '\n';
  }
  for (const g of model.gateways) {
    out += toMMELModel(g) + '\n';
  }
  for (const e of model.enums) {
    out += toMMELModel(e) + '\n';
  }
  for (const c of model.dataclasses) {
    out += toMMELModel(c) + '\n';
  }
  for (const d of model.regs) {
    out += toMMELModel(d) + '\n';
  }
  for (const p of model.pages) {
    out += toMMELModel(p) + '\n';
  }
  for (const v of model.vars) {
    out += toMMELModel(v) + '\n';
  }
  for (const r of model.refs) {
    out += toMMELModel(r) + '\n';
  }
  return out;
}

function parseModel(input: string): ParsingModel {
  const m: MMELModel = {
    meta: parseMetaData(''),
    roles: [],
    provisions: [],
    pages: [],
    processes: [],
    dataclasses: [],
    regs: [],
    events: [],
    gateways: [],
    refs: [],
    approvals: [],
    enums: [],
    vars: [],
    root: null,
  };
  const map: MMELObjectMaps = {
    roles: new Map<string, MMELRole>(),
    regs: new Map<string, MMELRegistry>(),
    nodes: new Map<string, MMELNode>(),
    refs: new Map<string, MMELReference>(),
    pages: new Map<string, MMELSubprocess>(),
    provisions: new Map<string, MMELProvision>(),
    dcs: new Map<string, MMELDataClass>(),
  };
  const container: ParsingModel = {
    content: m,
    maps: map,
    p_root: '',
    p_provisions: [],
    p_pages: [],
    p_processes: [],
    p_dataclasses: [],
    p_regs: [],
    p_approvals: [],
  };
  const token: Array<string> = MMELtokenize(input);
  let i = 0;
  while (i < token.length) {
    const command: string = token[i++];
    if (command === 'root') {
      container.p_root = token[i++].trim();
    } else if (command === 'metadata') {
      m.meta = parseMetaData(token[i++]);
    } else if (command === 'role') {
      const r = parseRole(token[i++], token[i++]);
      m.roles.push(r);
      map.roles.set(r.id, r);
    } else if (command === 'provision') {
      const p = parseProvision(token[i++], token[i++]);
      container.p_provisions.push(p);
      map.provisions.set(p.content.id, p.content);
    } else if (command === 'process') {
      const p = parseProcess(token[i++], token[i++]);
      container.p_processes.push(p);
      map.nodes.set(p.content.id, p.content);
    } else if (command === 'class') {
      const p = parseDataClass(token[i++], token[i++]);
      container.p_dataclasses.push(p);
      map.nodes.set(p.content.id, p.content);
      map.dcs.set(p.content.id, p.content);
    } else if (command === 'data_registry') {
      const p = parseRegistry(token[i++], token[i++]);
      container.p_regs.push(p);
      map.regs.set(p.content.id, p.content);
      map.nodes.set(p.content.id, p.content);
    } else if (command === 'start_event') {
      const p = parseStartEvent(token[i++], token[i++]);
      m.events.push(p);
      map.nodes.set(p.id, p);
    } else if (command === 'end_event') {
      const p = parseEndEvent(token[i++], token[i++]);
      m.events.push(p);
      map.nodes.set(p.id, p);
    } else if (command === 'timer_event') {
      const p = parseTimerEvent(token[i++], token[i++]);
      m.events.push(p);
      map.nodes.set(p.id, p);
    } else if (command === 'exclusive_gateway') {
      const p = parseEGate(token[i++], token[i++]);
      m.gateways.push(p);
      map.nodes.set(p.id, p);
    } else if (command === 'subprocess') {
      const p = parseSubprocess(token[i++], token[i++]);
      container.p_pages.push(p);
      map.pages.set(p.content.id, p.content);
    } else if (command === 'reference') {
      const p = parseReference(token[i++], token[i++]);
      m.refs.push(p);
      map.refs.set(p.id, p);
    } else if (command === 'approval') {
      const p = parseApproval(token[i++], token[i++]);
      container.p_approvals.push(p);
      map.nodes.set(p.content.id, p.content);
    } else if (command === 'enum') {
      const p = parseEnum(token[i++], token[i++]);
      m.enums.push(p);
    } else if (command === 'measurement') {
      const v = parseVariable(token[i++], token[i++]);
      m.vars.push(v);
    } else if (command === 'signal_catch_event') {
      const e = parseSignalCatchEvent(token[i++], token[i++]);
      m.events.push(e);
      map.nodes.set(e.id, e);
    } else {
      console.error('Unknown command ' + command);
      break;
    }
  }
  return container;
}

function resolveModel(container: ParsingModel): MMELModel {
  const model = container.content;
  const map = container.maps;
  if (container.p_root !== '') {
    const r = map.pages.get(container.p_root);
    if (r !== undefined) {
      model.root = r;
    }
  }
  for (const p of container.p_pages) {
    model.pages.push(resolveSubprocess(p, map.nodes));
  }
  for (const p of container.p_provisions) {
    model.provisions.push(resolveProvision(p, map.refs));
  }
  for (const p of container.p_approvals) {
    model.approvals.push(resolveApproval(p, map.roles, map.refs, map.regs));
  }
  for (const d of container.p_regs) {
    model.regs.push(resolveRegistry(d, map.dcs));
  }
  for (const d of container.p_dataclasses) {
    model.dataclasses.push(resolveDataClass(d, map.refs));
  }
  for (const p of container.p_processes) {
    model.processes.push(
      resolveProcess(p, map.regs, map.provisions, map.roles, map.pages)
    );
  }
  return model;
}
