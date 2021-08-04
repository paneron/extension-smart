import { DataType } from '../serialize/interface/baseinterface';
import {
  MMELDataAttribute,
  MMELEnum,
  MMELEnumValue,
} from '../serialize/interface/datainterface';
import {
  MMELEdge,
  MMELSubprocessComponent,
} from '../serialize/interface/flowcontrolinterface';
import {
  MMELMetadata,
  MMELProvision,
  MMELReference,
  MMELRole,
  MMELVariable,
  VarType,
} from '../serialize/interface/supportinterface';
import {
  EditorApproval,
  EditorDataClass,
  EditorEGate,
  EditorEndEvent,
  EditorModel,
  EditorProcess,
  EditorRegistry,
  EditorSignalEvent,
  EditorStartEvent,
  EditorSubprocess,
  EditorTimerEvent,
} from '../model/editormodel';

export function createNewModel(): EditorModel {
  const start = createStartEvent('Start1');
  const page = createSubprocess('Root', start);
  start.pages.add(page);
  const com = createSubprocessComponent(start.id);
  page.childs[start.id] = com;
  const m: EditorModel = {
    meta: createMetaData(),
    roles: {},
    provisions: {},
    pages: { [page.id]: page },
    elements: { [start.id]: start },
    refs: {},
    enums: {},
    vars: {},
    root: page.id,
  };
  return m;
}

export function createEnum(id: string): MMELEnum {
  return {
    id: id,
    values: {},
    datatype: DataType.ENUM,
  };
}

export function createEnumValue(id: string): MMELEnumValue {
  return {
    id: id,
    value: '',
    datatype: DataType.ENUMVALUE,
  };
}

export function createMetaData(): MMELMetadata {
  return {
    schema: '',
    author: '',
    title: '',
    edition: '',
    namespace: '',
    datatype: DataType.METADATA,
  };
}

export function createProvision(id: string): MMELProvision {
  return {
    subject: {},
    id: id,
    modality: '',
    condition: '',
    ref: new Set<string>(),
    datatype: DataType.PROVISION,
  };
}

export function createReference(id: string): MMELReference {
  return {
    id: id,
    document: '',
    clause: '',
    datatype: DataType.REFERENCE,
  };
}

export function createRole(id: string): MMELRole {
  return {
    id: id,
    name: '',
    datatype: DataType.ROLE,
  };
}

export function createSubprocess(
  id: string,
  start: EditorStartEvent
): EditorSubprocess {
  return {
    id: id,
    childs: {},
    edges: {},
    data: {},
    datatype: DataType.SUBPROCESS,
    objectVersion: 'Editor',
    start: start,
  };
}

export function createDataAttribute(id: string): MMELDataAttribute {
  return {
    id: id,
    type: '',
    modality: '',
    cardinality: '',
    definition: '',
    ref: new Set<string>(),
    satisfy: new Set<string>(),
    datatype: DataType.DATAATTRIBUTE,
  };
}

export function createDataClass(id: string): EditorDataClass {
  return {
    id: id,
    attributes: {},
    datatype: DataType.DATACLASS,
    objectVersion: 'Editor',
    child: new Set<MMELEdge>(),
    added: false,
    pages: new Set<EditorSubprocess>(),
    rdcs: new Set<EditorDataClass>(),
    mother: null,
  };
}

export function createRegistry(id: string): EditorRegistry {
  return {
    id: id,
    title: '',
    data: '',
    datatype: DataType.REGISTRY,
    objectVersion: 'Editor',
    child: new Set<MMELEdge>(),
    added: false,
    pages: new Set<EditorSubprocess>(),
  };
}

export function createStartEvent(id: string): EditorStartEvent {
  return {
    id: id,
    datatype: DataType.STARTEVENT,
    child: new Set<MMELEdge>(),
    added: false,
    objectVersion: 'Editor',
    pages: new Set<EditorSubprocess>(),
  };
}

export function createSubprocessComponent(id: string): MMELSubprocessComponent {
  return {
    element: id,
    x: 0,
    y: 0,
    datatype: DataType.SUBPROCESSCOMPONENT,
  };
}

export function createEdge(id: string): MMELEdge {
  return {
    id: id,
    from: '',
    to: '',
    description: '',
    condition: '',
    datatype: DataType.EDGE,
  };
}

export function createProcess(id: string): EditorProcess {
  return {
    id: id,
    datatype: DataType.PROCESS,
    name: '',
    modality: '',
    actor: '',
    output: new Set<string>(),
    input: new Set<string>(),
    provision: new Set<string>(),
    page: '',
    measure: [],
    child: new Set<MMELEdge>(),
    added: false,
    objectVersion: 'Editor',
    pages: new Set<EditorSubprocess>(),
  };
}

export function createApproval(id: string): EditorApproval {
  return {
    id: id,
    datatype: DataType.APPROVAL,
    name: '',
    modality: '',
    actor: '',
    approver: '',
    records: new Set<string>(),
    ref: new Set<string>(),
    child: new Set<MMELEdge>(),
    added: false,
    objectVersion: 'Editor',
    pages: new Set<EditorSubprocess>(),
  };
}

export function createVariable(id: string): MMELVariable {
  return {
    id: id,
    type: VarType.DATA,
    definition: '',
    description: '',
    datatype: DataType.VARIABLE,
  };
}

export function createEndEvent(id: string): EditorEndEvent {
  return {
    id: id,
    datatype: DataType.ENDEVENT,
    child: new Set<MMELEdge>(),
    added: false,
    objectVersion: 'Editor',
    pages: new Set<EditorSubprocess>(),
  };
}

export function createTimerEvent(id: string): EditorTimerEvent {
  return {
    id: id,
    datatype: DataType.TIMEREVENT,
    type: '',
    para: '',
    child: new Set<MMELEdge>(),
    added: false,
    objectVersion: 'Editor',
    pages: new Set<EditorSubprocess>(),
  };
}

export function createSignalCatchEvent(id: string): EditorSignalEvent {
  return {
    id: id,
    datatype: DataType.SIGNALCATCHEVENT,
    signal: '',
    child: new Set<MMELEdge>(),
    added: false,
    objectVersion: 'Editor',
    pages: new Set<EditorSubprocess>(),
  };
}

export function createEGate(id: string): EditorEGate {
  return {
    id: id,
    datatype: DataType.EGATE,
    label: '',
    child: new Set<MMELEdge>(),
    added: false,
    objectVersion: 'Editor',
    pages: new Set<EditorSubprocess>(),
  };
}
