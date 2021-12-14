import { DataType, MMELNode } from '../serialize/interface/baseinterface';
import { MMELEnum } from '../serialize/interface/datainterface';
import { MMELSubprocess } from '../serialize/interface/flowcontrolinterface';
import {
  MMELFigure,
  MMELLink,
  MMELMetadata,
  MMELReference,
  MMELRole,
  MMELTable,
  MMELTerm,
  MMELTextSection,
  MMELVariable,
  MMELView,
  NOTE_TYPE,
} from '../serialize/interface/supportinterface';
import { JSONContextType } from '../utils/repo/io';

export type MMELJSON = {
  '@context': JSONContextType;
  '@type': 'MMEL_SMART';
  meta?: MMELMetadata;
  roles?: Record<string, MMELRole>;
  provisions?: Record<string, JSONProvision>;
  elements?: Record<string, MMELNode>;
  refs?: Record<string, MMELReference>;
  enums?: Record<string, MMELEnum>;
  vars?: Record<string, MMELVariable>;
  notes?: Record<string, JSONNote>;
  pages?: Record<string, MMELSubprocess>;
  views?: Record<string, MMELView>;
  terms?: Record<string, MMELTerm>;
  tables?: Record<string, MMELTable>;
  figures?: Record<string, MMELFigure>;
  sections?: Record<string, MMELTextSection>;
  links?: Record<string, MMELLink>;
  root?: string;
  version?: string;
};

export type JSONProvision = {
  subject: Record<string, string>;
  id: string;
  modality: string;
  condition: string;
  ref: string[];
  datatype: DataType.PROVISION;
};

export type JSONNote = {
  id: string;
  type: NOTE_TYPE;
  message: string;
  ref: string[];
  datatype: DataType.NOTE;
};

export type JSONProcess = {
  id: string;
  name: string;
  modality: string;
  actor: string;
  output: string[];
  input: string[];
  provision: string[];
  links: string[];
  notes: string[];
  tables: string[];
  figures: string[];
  page: string;
  measure: string[];
  datatype: DataType.PROCESS;
};

export type JSONDataAttribute = {
  id: string;
  type: string;
  modality: string;
  cardinality: string;
  definition: string;
  ref: string[];
  satisfy: string[];
  datatype: DataType.DATAATTRIBUTE;
};

export type JSONDataclass = {
  id: string;
  attributes: Record<string, JSONDataAttribute>;
  datatype: DataType.DATACLASS;
};

export type JSONRegistry = {
  id: string;
  title: string;
  data: string;
  datatype: DataType.REGISTRY;
};

export type JSONApproval = {
  id: string;
  name: string;
  modality: string;
  actor: string;
  approver: string;
  records: string[];
  ref: string[];
  datatype: DataType.APPROVAL;
};

export function isJSONProcess(x: MMELNode): x is JSONProcess {
  return x.datatype === DataType.PROCESS;
}

export function isJSONApproval(x: MMELNode): x is JSONApproval {
  return x.datatype === DataType.APPROVAL;
}

export function isJSONDataClass(x: MMELNode): x is JSONDataclass {
  return x.datatype === DataType.DATACLASS;
}
