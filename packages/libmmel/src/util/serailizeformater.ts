import { MMELNode } from '@/interface/baseinterface';
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
import { MMELApproval, MMELProcess } from '@/interface/processinterface';
import {
  MMELComment,
  MMELFigure,
  MMELLink,
  MMELMetadata,
  MMELNote,
  MMELProvision,
  MMELReference,
  MMELRole,
  MMELTable,
  MMELTerm,
  MMELTextSection,
  MMELVariable,
  MMELVarSetting,
  MMELView,
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

/**
 * Convert the model to text
 */
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
  if (a.ref.size > 0) {
    out += '    reference {\n';
    for (const r of a.ref) {
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
  out += '  type ' + v.type + '\n';
  if (v.definition !== '') {
    out += '  definition "' + v.definition + '"\n';
  }
  if (v.description !== '') {
    out += '  description "' + v.description + '"\n';
  }
  out += '}\n';
  return out;
}

export function toViewProfile(v: MMELView): string {
  let out: string = 'view ' + v.id + ' {\n';
  out += '  name "' + v.name + '"\n';
  out += '  variables {\n';
  for (const e in v.profile) {
    out += toVarSettingModel(v.profile[e]);
  }
  out += '  }\n';
  out += '}\n';
  return out;
}

export function toNoteModel(x: MMELNote): string {
  let out: string = 'note ' + x.id + ' {\n';
  out += '  type ' + x.type + '\n';
  out += '  message "' + x.message + '"\n';
  if (x.ref.size > 0) {
    out += '  reference {\n';
    for (const r of x.ref) {
      out += '    ' + r + '\n';
    }
    out += '  }\n';
  }
  out += '}\n';
  return out;
}

export function toVarSettingModel(v: MMELVarSetting): string {
  let out = `    ${v.id} {\n`;
  out += `      required ${v.isConst ? 'true' : 'false'}\n`;
  out += `      value "${v.value}"\n`;
  out += '    }\n';
  return out;
}

export function toMetaDataModel(meta: MMELMetadata): string {
  let out = 'metadata {\n';
  out += '  title "' + meta.title + '"\n';
  out += '  schema "' + meta.schema + '"\n';
  out += '  edition "' + meta.edition + '"\n';
  out += '  author "' + meta.author + '"\n';
  out += '  shortname "' + meta.shortname + '"\n';
  out += '  namespace "' + meta.namespace + '"\n';
  out += '}\n';
  return out;
}

export function toProvisionModel(pro: MMELProvision): string {
  let out: string = 'provision ' + pro.id + ' {\n';
  out += '  condition "' + pro.condition + '"\n';
  if (pro.modality !== '') {
    out += '  modality ' + pro.modality + '\n';
  }
  if (pro.ref.size > 0) {
    out += '  reference {\n';
    for (const r of pro.ref) {
      out += '    ' + r + '\n';
    }
    out += '  }\n';
  }
  out += '}\n';
  return out;
}

export function toReferenceModel(ref: MMELReference): string {
  return (
    'reference ' +
    ref.id +
    ' {\n' +
    '  document "' +
    ref.document +
    '"\n' +
    '  clause "' +
    ref.clause +
    '"\n' +
    '  title "' +
    ref.title +
    '"\n' +
    '}\n'
  );
}

export function toTermsModel(term: MMELTerm): string {
  let out: string = 'term ' + term.id + ' {\n';
  out += '  term "' + term.term + '"\n';
  out += '  definition "' + term.definition + '"\n';
  for (const x of term.admitted) {
    out += '  admitted "' + x + '"\n';
  }
  for (const x of term.notes) {
    out += '  note "' + x + '"\n';
  }
  out += '}\n';
  return out;
}

export function toFigModel(fig: MMELFigure): string {
  return (
    `figure ${fig.id} {\n` +
    `  title "${fig.title}"\n` +
    `  data "${fig.data}"\n` +
    `  type ${fig.type ?? 'fig'}\n` +
    '}\n'
  );
}

export function toSectionModel(s: MMELTextSection): string {
  return (
    `section ${s.id} {\n` +
    `  title "${s.title}"\n` +
    `  content "${s.content}"\n` +
    '}\n'
  );
}

export function toLinkModel(l: MMELLink): string {
  let out: string = 'link ' + l.id + ' {\n';
  out += '  title "' + l.title + '"\n';
  out += '  description "' + l.description + '"\n';
  out += '  link "' + l.link + '"\n';
  out += '  type ' + l.type + '\n';
  out += '}\n';
  return out;
}

export function toCommentModel(c: MMELComment): string {
  let out: string = 'comment ' + c.id + ' {\n';
  out += '  username "' + c.username + '"\n';
  out += '  message "' + c.message + '"\n';
  out += '  timestamp "' + c.timestamp + '"\n';
  if (c.feedback.size > 0) {
    out += '  feedback {\n';
    for (const r of c.feedback) {
      out += '    ' + r + '\n';
    }
    out += '  }\n';
  }
  if (c.resolved) {
    out += '  resolved\n';
  }
  out += '}\n';
  return out;
}

export function toTableModel(table: MMELTable): string {
  let out: string = 'table ' + table.id + ' {\n';
  out += '  title "' + table.title + '"\n';
  out += '  columns "' + table.columns + '"\n';
  out += '  display "' + table.classDisplay + '"\n';
  out += '  domain {\n';
  for (const d of table.domain) {
    out += '    "' + d + '"\n';
  }
  out += '  }\n';
  out += '  data {\n';
  for (const row of table.data) {
    out += '    ' + row.map(x => `"${x}"`).join(' ') + '\n';
  }
  out += '  }\n';
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
  if (app.modality !== '') {
    out += '  modality ' + app.modality + '\n';
  }
  if (app.approver !== '') {
    out += '  approve_by ' + app.approver + '\n';
  }
  if (app.records.size > 0) {
    out += '  approval_record {\n';
    for (const dr of app.records) {
      out += '    ' + dr + '\n';
    }
    out += '  }\n';
  }
  if (app.ref.size > 0) {
    out += '  reference {\n';
    for (const r of app.ref) {
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
    for (const dr of process.input) {
      out += '    ' + dr + '\n';
    }
    out += '  }\n';
  }
  if (process.provision.size > 0) {
    out += '  validate_provision {\n';
    for (const r of process.provision) {
      out += '    ' + r + '\n';
    }
    out += '  }\n';
  }
  if (process.links.size > 0) {
    out += '  links {\n';
    for (const r of process.links) {
      out += '    ' + r + '\n';
    }
    out += '  }\n';
  }
  if (process.notes.size > 0) {
    out += '  note {\n';
    for (const r of process.notes) {
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
  if (process.tables.size > 0) {
    out += '  table {\n';
    for (const r of process.tables) {
      out += '    ' + r + '\n';
    }
    out += '  }\n';
  }
  if (process.figures.size > 0) {
    out += '  figure {\n';
    for (const r of process.figures) {
      out += '    ' + r + '\n';
    }
    out += '  }\n';
  }
  if (process.output.size > 0) {
    out += '  output {\n';
    for (const c of process.output) {
      out += '    ' + c + '\n';
    }
    out += '  }\n';
  }
  if (process.comments.size > 0) {
    out += '  comment {\n';
    for (const r of process.comments) {
      out += '    ' + r + '\n';
    }
    out += '  }\n';
  }
  if (process.page !== '') {
    out += '  subprocess ' + process.page + '\n';
  }
  out += '}\n';
  return out;
}
