import { MMELNode } from '../interface/baseinterface';
import {
  MMELDataAttribute,
  MMELDataClass,
  MMELEnum,
  MMELEnumValue,
  MMELRegistry,
} from '../interface/datainterface';
import {
  MMELEndEvent,
  MMELSignalCatchEvent,
  MMELStartEvent,
  MMELTimerEvent,
} from '../interface/eventinterface';
import {
  MMELEdge,
  MMELEGate,
  MMELSubprocess,
  MMELSubprocessComponent,
} from '../interface/flowcontrolinterface';
import { MMELApproval, MMELProcess } from '../interface/processinterface';
import {
  MMELMetadata,
  MMELProvision,
  MMELReference,
  MMELRole,
  MMELVariable,
  VarType,
} from '../interface/supportinterface';
import {
  isApproval,
  isDataClass,
  isEGate,
  isEndEvent,
  isProcess,
  isRegistry,
  isSignalEvent,
  isStartEvent,
  isTimerEvent,
} from './validation';

export function toNodeModel(x: MMELNode): string {
  if (isDataClass(x)) {
    return toDataClassModel(x);
  } else if (isRegistry(x)) {
    return toRegistryModel(x);
  } else if (isEndEvent(x)) {
    return toEndEventModel(x);
  } else if (isSignalEvent(x)) {
    return toSignalCatchEventModel(x);
  } else if (isStartEvent(x)) {
    return toStartEventModel(x);
  } else if (isTimerEvent(x)) {
    return toTimerEventModel(x);
  } else if (isEGate(x)) {
    return toEGateModel(x);
  } else if (isApproval(x)) {
    return toApprovalModel(x);
  } else if (isProcess(x)) {
    return toProcessModel(x);
  }
  throw new Error('Unknown object' + x);
}

function toDataAttributeModel(a: MMELDataAttribute): string {
  let out: string = '  ' + a.id;
  if (a.type !== '') {
    out += ': ' + a.type;
  }
  if (a.cardinality !== '') {
    out += '[' + a.cardinality + ']';
  }
  out += ' {\n';
  out += '    definition "' + a.definition + '"\n';
  if (a.modality !== '') {
    out += '    modality ' + a.modality + '\n';
  }
  if (a.satisfy.size > 0) {
    out += '    satisfy {\n';
    for (const s in a.satisfy) {
      out += '      ' + s + '\n';
    }
    out += '    }\n';
  }
  if (a.ref.size > 0) {
    out += '    reference {\n';
    for (const r in a.ref) {
      out += '      ' + r + '\n';
    }
    out += '    }\n';
  }
  out += '  }\n';
  return out;
}

function toDataClassModel(dc: MMELDataClass): string {
  let out: string = 'class ' + dc.id + ' {\n';
  for (const a in dc.attributes) {
    out += toDataAttributeModel(dc.attributes[a]);
  }
  out += '}\n';
  return out;
}

function toEnumValueModel(ev: MMELEnumValue): string {
  let out: string = '  ' + ev.id + ' {\n';
  out += '    definition "' + ev.value + '"\n';
  out += '  }\n';
  return out;
}

export function toEnumModel(e: MMELEnum): string {
  let out: string = 'enum ' + e.id + ' {\n';
  for (const v in e.values) {
    out += toEnumValueModel(e.values[v]);
  }
  out += '}\n';
  return out;
}

function toRegistryModel(reg: MMELRegistry): string {
  let out: string = 'data_registry ' + reg.id + ' {\n';
  out += '  title "' + reg.title + '"\n';
  if (reg.data !== '') {
    out += '  data_class ' + reg.data + '\n';
  }
  out += '}\n';
  return out;
}

function toEndEventModel(end: MMELEndEvent): string {
  return 'end_event ' + end.id + ' {\n}\n';
}

function toSignalCatchEventModel(sc: MMELSignalCatchEvent): string {
  let out: string = 'signal_catch_event ' + sc.id + ' {\n';
  if (sc.signal !== '') {
    out += '  catch "' + sc.signal + '"\n';
  }
  out += '}\n';
  return out;
}

function toStartEventModel(s: MMELStartEvent): string {
  return 'start_event ' + s.id + ' {\n}\n';
}

function toTimerEventModel(te: MMELTimerEvent): string {
  let out: string = 'timer_event ' + te.id + ' {\n';
  if (te.type !== '') {
    out += '  type ' + te.type + '\n';
  }
  if (te.para !== '') {
    out += '  para "' + te.para + '"\n';
  }
  out += '}\n';
  return out;
}

function toEdgeModel(edge: MMELEdge): string {
  let out: string = '    ' + edge.id + ' {\n';
  if (edge.from !== '') {
    out += '      from ' + edge.from + '\n';
  }
  if (edge.to !== '') {
    out += '      to ' + edge.to + '\n';
  }
  if (edge.description !== '') {
    out += '      description "' + edge.description + '"\n';
  }
  if (edge.condition !== '') {
    out += '      condition "' + edge.condition + '"\n';
  }
  out += '    }\n';
  return out;
}

export function toSubprocessModel(sub: MMELSubprocess): string {
  let out: string = 'subprocess ' + sub.id + ' {\n';
  out += '  elements {\n';
  for (const x in sub.childs) {
    out += toSubprocessComponentModel(sub.childs[x]);
  }
  out += '  }\n';
  out += '  process_flow {\n';
  for (const e in sub.edges) {
    out += toEdgeModel(sub.edges[e]);
  }
  out += '  }\n';
  out += '  data {\n';
  for (const d in sub.data) {
    out += toSubprocessComponentModel(sub.data[d]);
  }
  out += '  }\n';
  out += '}\n';
  return out;
}

function toSubprocessComponentModel(com: MMELSubprocessComponent): string {
  if (com.element === '') {
    return '';
  }
  let out: string = '    ' + com.element + ' {\n';
  out += '      x ' + com.x + '\n';
  out += '      y ' + com.y + '\n';
  out += '    }\n';
  return out;
}

function toEGateModel(egate: MMELEGate): string {
  let out: string = 'exclusive_gateway ' + egate.id + ' {\n';
  if (egate.label !== '') {
    out += '  label "' + egate.label + '"\n';
  }
  out += '}\n';
  return out;
}

export function toVariableModel(v: MMELVariable): string {
  let out: string = 'measurement ' + v.id + ' {\n';
  if (v.type !== VarType.EMPTY) {
    out += '  type ' + v.type + '\n';
  }
  if (v.definition !== '') {
    out += '  definition "' + v.definition + '"\n';
  }
  if (v.description !== '') {
    out += '  description "' + v.description + '"\n';
  }
  out += '}\n';
  return out;
}

export function toMetaDataModel(meta: MMELMetadata): string {
  let out = 'metadata {\n';
  out += '  title "' + meta.title + '"\n';
  out += '  schema "' + meta.schema + '"\n';
  out += '  edition "' + meta.edition + '"\n';
  out += '  author "' + meta.author + '"\n';
  out += '  namespace "' + meta.namespace + '"\n';
  out += '}\n';
  return out;
}

export function toProvisionModel(pro: MMELProvision): string {
  let out: string = 'provision ' + pro.id + ' {\n';
  for (const x in pro.subject) {
    out += '  ' + x + ' ' + pro.subject[x] + '\n';
  }
  out += '  condition "' + pro.condition + '"\n';
  if (pro.modality !== '') {
    out += '  modality ' + pro.modality + '\n';
  }
  if (pro.ref.size > 0) {
    out += '  reference {\n';
    for (const r in pro.ref) {
      out += '    ' + r + '\n';
    }
    out += '  }\n';
  }
  out += '}\n';
  return out;
}

export function toReferenceModel(ref: MMELReference): string {
  let out: string = 'reference ' + ref.id + ' {\n';
  out += '  document "' + ref.document + '"\n';
  out += '  clause "' + ref.clause + '"\n';
  out += '}\n';
  return out;
}

export function toRoleModel(role: MMELRole): string {
  let out: string = 'role ' + role.id + ' {\n';
  out += '  name "' + role.name + '"\n';
  out += '}\n';
  return out;
}

function toApprovalModel(app: MMELApproval): string {
  let out: string = 'approval ' + app.id + ' {\n';
  out += '  name "' + app.name + '"\n';
  if (app.actor !== '') {
    out += '  actor ' + app.actor + '\n';
  }
  out += '  modality ' + app.modality + '\n';
  if (app.approver !== '') {
    out += '  approve_by ' + app.approver + '\n';
  }
  if (app.records.size > 0) {
    out += '  approval_record {\n';
    for (const dr in app.records) {
      out += '    ' + dr + '\n';
    }
    out += '  }\n';
  }
  if (app.ref.size > 0) {
    out += '  reference {\n';
    for (const r in app.ref) {
      out += '    ' + r + '\n';
    }
    out += '  }\n';
  }
  out += '}\n';
  return out;
}

export function toProcessModel(process: MMELProcess): string {
  let out: string = 'process ' + process.id + ' {\n';
  out += '  name "' + process.name + '"\n';
  if (process.actor !== '') {
    out += '  actor ' + process.actor + '\n';
  }
  if (process.modality !== '') {
    out += '  modality ' + process.modality + '\n';
  }
  if (process.input.size > 0) {
    out += '  reference_data_registry {\n';
    for (const dr in process.input) {
      out += '    ' + dr + '\n';
    }
    out += '  }\n';
  }
  if (process.provision.size > 0) {
    out += '  validate_provision {\n';
    for (const r in process.provision) {
      out += '    ' + r + '\n';
    }
    out += '  }\n';
  }
  if (process.measure.length > 0) {
    out += '  validate_measurement {\n';
    for (const v of process.measure) {
      out += '    "' + v + '"\n';
    }
    out += '  }\n';
  }
  if (process.output.size > 0) {
    out += '  output {\n';
    for (const c in process.output) {
      out += '    ' + c + '\n';
    }
    out += '  }\n';
  }
  if (process.page !== '') {
    out += '  subprocess ' + process.page + '\n';
  }
  out += '}\n';
  return out;
}
