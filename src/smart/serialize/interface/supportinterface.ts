import { DataType, MMELObject } from './baseinterface';

export enum VarType {
  DATA = 'DATAITEM',
  LISTDATA = 'DATALIST',
  TEXT = 'TEXT',
  DERIVED = 'DERIVED',
  BOOLEAN = 'TRUE/FALSE',
}

export const NOTE_TYPES = ['NOTE', 'EXAMPLE', 'DEFINITION'] as const;
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
