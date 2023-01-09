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
  MMELFigure,
  MMELMetadata,
  MMELNote,
  MMELProvision,
  MMELReference,
  MMELRole,
  MMELTable,
  MMELTerm,
  MMELTextSection,
  MMELVariable,
  MMELView,
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
import { DOCVERSION, MODELVERSION } from './constants';
import { MMELDocument } from '../model/document';

export function createNewEditorModel(): EditorModel {
  const start = createStartEvent('Start1');
  const page = createSubprocess('Root', start.id);
  const com = createSubprocessComponent(start.id);
  page.childs[start.id] = com;
  const m: EditorModel = {
    meta       : createMetaData(),
    roles      : {},
    provisions : {},
    pages      : { [page.id] : page },
    elements   : { [start.id] : start },
    refs       : {},
    enums      : {},
    vars       : {},
    views      : {},
    notes      : {},
    terms      : {},
    tables     : {},
    figures    : {},
    sections   : {},
    comments   : {},
    links      : {},
    root       : page.id,
    version    : MODELVERSION,
  };
  return m;
}

export function createEnum(id: string): MMELEnum {
  return {
    id       : id,
    values   : {},
    datatype : DataType.ENUM,
  };
}

export function createEnumValue(id: string): MMELEnumValue {
  return {
    id       : id,
    value    : '',
    datatype : DataType.ENUMVALUE,
  };
}

export function createMetaData(): MMELMetadata {
  return {
    schema    : '',
    author    : '',
    title     : '',
    edition   : '',
    namespace : '',
    shortname : '',
    datatype  : DataType.METADATA,
  };
}

export function createProvision(id: string): MMELProvision {
  return {
    id        : id,
    modality  : '',
    condition : '',
    ref       : new Set<string>(),
    datatype  : DataType.PROVISION,
  };
}

export function createNote(id: string): MMELNote {
  return {
    id       : id,
    type     : 'NOTE',
    message  : '',
    ref      : new Set<string>(),
    datatype : DataType.NOTE,
  };
}

export function createReference(id: string): MMELReference {
  return {
    id       : id,
    document : '',
    clause   : '',
    title    : '',
    datatype : DataType.REFERENCE,
  };
}

export function createRole(id: string): MMELRole {
  return {
    id       : id,
    name     : '',
    datatype : DataType.ROLE,
  };
}

export function createTextSection(id: string): MMELTextSection {
  return {
    id       : id,
    title    : '',
    content  : '',
    datatype : DataType.SECTION,
  };
}

export function createTerm(id: string): MMELTerm {
  return {
    id         : id,
    term       : '',
    definition : '',
    admitted   : [],
    notes      : [],
    datatype   : DataType.TERMS,
  };
}

export function createSubprocess(id: string, start: string): EditorSubprocess {
  return {
    id            : id,
    childs        : {},
    edges         : {},
    data          : {},
    datatype      : DataType.SUBPROCESS,
    neighbor      : {},
    objectVersion : 'Editor',
    start         : start,
  };
}

export function createDataAttribute(id: string): MMELDataAttribute {
  return {
    id          : id,
    type        : '',
    modality    : '',
    cardinality : '',
    definition  : '',
    ref         : new Set<string>(),
    datatype    : DataType.DATAATTRIBUTE,
  };
}

export function createDataClass(id: string): EditorDataClass {
  return {
    id            : id,
    attributes    : {},
    datatype      : DataType.DATACLASS,
    objectVersion : 'Editor',
    rdcs          : new Set<string>(),
    mother        : '',
  };
}

export function createRegistry(id: string): EditorRegistry {
  return {
    id            : id,
    title         : '',
    data          : '',
    datatype      : DataType.REGISTRY,
    objectVersion : 'Editor',
  };
}

export function createStartEvent(id: string): EditorStartEvent {
  return {
    id            : id,
    datatype      : DataType.STARTEVENT,
    objectVersion : 'Editor',
  };
}

export function createSubprocessComponent(id: string): MMELSubprocessComponent {
  return {
    element  : id,
    x        : 0,
    y        : 0,
    datatype : DataType.SUBPROCESSCOMPONENT,
  };
}

export function createEdge(id: string): MMELEdge {
  return {
    id          : id,
    from        : '',
    to          : '',
    description : '',
    condition   : '',
    datatype    : DataType.EDGE,
  };
}

export function createProcess(id: string): EditorProcess {
  return {
    id            : id,
    datatype      : DataType.PROCESS,
    name          : '',
    modality      : '',
    actor         : '',
    output        : new Set<string>(),
    input         : new Set<string>(),
    notes         : new Set<string>(),
    provision     : new Set<string>(),
    links         : new Set<string>(),
    tables        : new Set<string>(),
    figures       : new Set<string>(),
    comments      : new Set<string>(),
    page          : '',
    measure       : [],
    objectVersion : 'Editor',
    pages         : new Set<string>(),
  };
}

export function createApproval(id: string): EditorApproval {
  return {
    id            : id,
    datatype      : DataType.APPROVAL,
    name          : '',
    modality      : '',
    actor         : '',
    approver      : '',
    records       : new Set<string>(),
    ref           : new Set<string>(),
    objectVersion : 'Editor',
  };
}

export function createVariable(id: string): MMELVariable {
  return {
    id          : id,
    type        : VarType.DATA,
    definition  : '',
    description : '',
    datatype    : DataType.VARIABLE,
  };
}

export function createFig(id: string): MMELFigure {
  return {
    id,
    title    : id,
    data     : '',
    type     : 'fig',
    datatype : DataType.FIGURE,
  };
}

export function createTable(id: string): MMELTable {
  return {
    id,
    title        : id,
    columns      : 3,
    data         : [],
    classDisplay : '',
    domain       : [],
    datatype     : DataType.TABLE,
  };
}

export function createView(id: string): MMELView {
  return {
    id       : id,
    name     : '',
    profile  : {},
    datatype : DataType.VIEW,
  };
}

export function createEndEvent(id: string): EditorEndEvent {
  return {
    id            : id,
    datatype      : DataType.ENDEVENT,
    objectVersion : 'Editor',
  };
}

export function createTimerEvent(id: string): EditorTimerEvent {
  return {
    id            : id,
    datatype      : DataType.TIMEREVENT,
    type          : '',
    para          : '',
    objectVersion : 'Editor',
  };
}

export function createSignalCatchEvent(id: string): EditorSignalEvent {
  return {
    id            : id,
    datatype      : DataType.SIGNALCATCHEVENT,
    signal        : '',
    objectVersion : 'Editor',
  };
}

export function createEGate(id: string): EditorEGate {
  return {
    id            : id,
    datatype      : DataType.EGATE,
    label         : '',
    objectVersion : 'Editor',
  };
}

export function createNewMMELDocument(): MMELDocument {
  return {
    states   : {},
    id       : '',
    title    : '',
    sections : [],
    type     : 'document',
    version  : DOCVERSION,
  };
}
