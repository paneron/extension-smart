import { DataType, MMELObject } from './baseinterface';

export enum VarType {
  DATA = 'NUMERIC',
  LISTDATA = 'DATALIST',
  TEXT = 'TEXT',
  DERIVED = 'DERIVED',
  BOOLEAN = 'TRUE/FALSE',
  TABLE = 'TABLE_REFERENCE',
  TABLEITEM = 'TABLE_OPTIONS',
}

export const NOTE_TYPES = [
  'NOTE',
  'EXAMPLE',
  'DEFINITION',
  'COMMENTARY',
] as const;
export type NOTE_TYPE = typeof NOTE_TYPES[number];

export interface MMELMetadata extends MMELObject {
  schema: string;
  author: string;
  title: string;
  shortname: string;
  edition: string;
  namespace: string;
  datatype: DataType.METADATA;
}

export interface MMELReference extends MMELObject {
  id: string;
  document: string;
  clause: string;
  title: string;
  datatype: DataType.REFERENCE;
}

export interface MMELProvision extends MMELObject {
  subject: Record<string, string>;
  id: string;
  modality: string;
  condition: string;
  ref: Set<string>;
  datatype: DataType.PROVISION;
}

export interface MMELRole extends MMELObject {
  id: string;
  name: string;
  datatype: DataType.ROLE;
}

export interface MMELVariable extends MMELObject {
  id: string;
  type: VarType;
  definition: string;
  description: string;
  datatype: DataType.VARIABLE;
}

export interface MMELVarSetting {
  id: string;
  isConst: boolean;
  value: string;
}

export interface MMELView extends MMELObject {
  datatype: DataType.VIEW;
  id: string;
  name: string;
  profile: Record<string, MMELVarSetting>;
}

export interface MMELNote extends MMELObject {
  id: string;
  type: NOTE_TYPE;
  message: string;
  ref: Set<string>;
  datatype: DataType.NOTE;
}

export interface MMELTerm extends MMELObject {
  id: string;
  term: string;
  admitted: string[];
  definition: string;
  notes: string[];
  datatype: DataType.TERMS;
}

export interface MMELTable extends MMELObject {
  id: string;
  title: string;
  columns: number;
  data: string[][];
  datatype: DataType.TABLE;
}

export interface MMELFigure extends MMELObject {
  id: string;
  title: string;
  data: string;
  datatype: DataType.FIGURE;
}

export interface MMELTextSection extends MMELObject {
  id: string;
  title: string;
  content: string;
  datatype: DataType.SECTION;
}
