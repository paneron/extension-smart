import { DataType, MMELObject } from '../interface/baseinterface';
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
} from '../interface/supportinterface';

export function toMMELModel(x: MMELObject): string {
  if (x.datatype === DataType.DATAATTRIBUTE) {
    return toDataAttributeModel(x as MMELDataAttribute);
  } else if (x.datatype === DataType.DATACLASS) {
    return toDataClassModel(x as MMELDataClass);
  } else if (x.datatype === DataType.ENUMVALUE) {
    return toEnumValueModel(x as MMELEnumValue);
  } else if (x.datatype === DataType.ENUM) {
    return toEnumModel(x as MMELEnum);
  } else if (x.datatype === DataType.REGISTRY) {
    return toRegistryModel(x as MMELRegistry);
  } else if (x.datatype === DataType.ENDEVENT) {
    return toEndEventModel(x as MMELEndEvent);
  } else if (x.datatype === DataType.SIGNALCATCHEVENT) {
    return toSignalCatchEventModel(x as MMELSignalCatchEvent);
  } else if (x.datatype === DataType.STARTEVENT) {
    return toStartEventModel(x as MMELStartEvent);
  } else if (x.datatype === DataType.TIMEREVENT) {
    return toTimerEventModel(x as MMELTimerEvent);
  } else if (x.datatype === DataType.EDGE) {
    return toEdgeModel(x as MMELEdge);
  } else if (x.datatype === DataType.SUBPROCESS) {
    return toSubprocessModel(x as MMELSubprocess);
  } else if (x.datatype === DataType.SUBPROCESSCOMPONENT) {
    return toSubprocessComponentModel(x as MMELSubprocessComponent);
  } else if (x.datatype === DataType.EGATE) {
    return toEGateModel(x as MMELEGate);
  } else if (x.datatype === DataType.VARIABLE) {
    return toVariableModel(x as MMELVariable);
  } else if (x.datatype === DataType.APPROVAL) {
    return toApprovalModel(x as MMELApproval);
  } else if (x.datatype === DataType.PROCESS) {
    return toProcessModel(x as MMELProcess);
  } else if (x.datatype === DataType.METADATA) {
    return toMetaDataModel(x as MMELMetadata);
  } else if (x.datatype === DataType.PROVISION) {
    return toProvisionModel(x as MMELProvision);
  } else if (x.datatype === DataType.REFERENCE) {
    return toReferenceModel(x as MMELReference);
  } else if (x.datatype === DataType.ROLE) {
    return toRoleModel(x as MMELRole);
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
  if (a.satisfy.length > 0) {
    out += '    satisfy {\n';
    for (const s of a.satisfy) {
      out += '      ' + s + '\n';
    }
    out += '    }\n';
  }
  if (a.ref.length > 0) {
    out += '    reference {\n';
    for (const r of a.ref) {
      out += '      ' + r.id + '\n';
    }
    out += '    }\n';
  }
  out += '  }\n';
  return out;
}

function toDataClassModel(dc: MMELDataClass): string {
  let out: string = 'class ' + dc.id + ' {\n';
  for (const a of dc.attributes) {
    out += toDataAttributeModel(a);
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

function toEnumModel(e: MMELEnum): string {
  let out: string = 'enum ' + e.id + ' {\n';
  for (const v of e.values) {
    out += toEnumValueModel(v);
  }
  out += '}\n';
  return out;
}

function toRegistryModel(reg: MMELRegistry): string {
  let out: string = 'data_registry ' + reg.id + ' {\n';
  out += '  title "' + reg.title + '"\n';
  if (reg.data !== null) {
    out += '  data_class ' + reg.data.id + '\n';
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
  if (edge.from !== null && edge.from.element !== null) {
    out += '      from ' + edge.from.element.id + '\n';
  }
  if (edge.to !== null && edge.to.element !== null) {
    out += '      to ' + edge.to.element.id + '\n';
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

function toSubprocessModel(sub: MMELSubprocess): string {
  let out: string = 'subprocess ' + sub.id + ' {\n';
  out += '  elements {\n';
  sub.childs.forEach(x => {
    out += toMMELModel(x);
  });
  out += '  }\n';
  out += '  process_flow {\n';
  sub.edges.forEach(e => {
    out += toMMELModel(e);
  });
  out += '  }\n';
  out += '  data {\n';
  sub.data.forEach(d => {
    out += toMMELModel(d);
  });
  out += '  }\n';
  out += '}\n';
  return out;
}

function toSubprocessComponentModel(com: MMELSubprocessComponent): string {
  if (com.element === null) {
    return '';
  }
  let out: string = '    ' + com.element.id + ' {\n';
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

function toVariableModel(v: MMELVariable): string {
  let out: string = 'measurement ' + v.id + ' {\n';
  if (v.type !== '') {
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

function toMetaDataModel(meta: MMELMetadata): string {
  let out = 'metadata {\n';
  out += '  title "' + meta.title + '"\n';
  out += '  schema "' + meta.schema + '"\n';
  out += '  edition "' + meta.edition + '"\n';
  out += '  author "' + meta.author + '"\n';
  out += '  namespace "' + meta.namespace + '"\n';
  out += '}\n';
  return out;
}

function toProvisionModel(pro: MMELProvision): string {
  let out: string = 'provision ' + pro.id + ' {\n';
  pro.subject.forEach((value: string, key: string) => {
    out += '  ' + key + ' ' + value + '\n';
  });
  out += '  condition "' + pro.condition + '"\n';
  if (pro.modality !== '') {
    out += '  modality ' + pro.modality + '\n';
  }
  if (pro.ref.length > 0) {
    out += '  reference {\n';
    for (const r of pro.ref) {
      out += '    ' + r.id + '\n';
    }
    out += '  }\n';
  }
  out += '}\n';
  return out;
}

function toReferenceModel(ref: MMELReference): string {
  let out: string = 'reference ' + ref.id + ' {\n';
  out += '  document "' + ref.document + '"\n';
  out += '  clause "' + ref.clause + '"\n';
  out += '}\n';
  return out;
}

function toRoleModel(role: MMELRole): string {
  let out: string = 'role ' + role.id + ' {\n';
  out += '  name "' + role.name + '"\n';
  out += '}\n';
  return out;
}

function toApprovalModel(app: MMELApproval): string {
  let out: string = 'approval ' + app.id + ' {\n';
  out += '  name "' + app.name + '"\n';
  if (app.actor !== null) {
    out += '  actor ' + app.actor.id + '\n';
  }
  out += '  modality ' + app.modality + '\n';
  if (app.approver !== null) {
    out += '  approve_by ' + app.approver.id + '\n';
  }
  if (app.records.length > 0) {
    out += '  approval_record {\n';
    for (const dr of app.records) {
      out += '    ' + dr.id + '\n';
    }
    out += '  }\n';
  }
  if (app.ref.length > 0) {
    out += '  reference {\n';
    for (const r of app.ref) {
      out += '    ' + r.id + '\n';
    }
    out += '  }\n';
  }
  out += '}\n';
  return out;
}

export function toProcessModel(process: MMELProcess): string {
  let out: string = 'process ' + process.id + ' {\n';
  out += '  name "' + process.name + '"\n';
  if (process.actor !== null) {
    out += '  actor ' + process.actor.id + '\n';
  }
  if (process.modality !== '') {
    out += '  modality ' + process.modality + '\n';
  }
  if (process.input.length > 0) {
    out += '  reference_data_registry {\n';
    for (const dr of process.input) {
      out += '    ' + dr.id + '\n';
    }
    out += '  }\n';
  }
  if (process.provision.length > 0) {
    out += '  validate_provision {\n';
    for (const r of process.provision) {
      out += '    ' + r.id + '\n';
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
  if (process.output.length > 0) {
    out += '  output {\n';
    for (const c of process.output) {
      out += '    ' + c.id + '\n';
    }
    out += '  }\n';
  }
  if (process.page !== null) {
    out += '  subprocess ' + process.page.id + '\n';
  }
  out += '}\n';
  return out;
}
