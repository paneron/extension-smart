import { MMELObject } from './baseinterface';

export enum VarType {
  DATA = 'DATAITEM',
  LISTDATA = 'DATALIST',
  TEXT = 'TEXT',
  DERIVED = 'DERIVED',
  BOOLEAN = 'TRUE/FALSE',
}

export interface MMELMetadata extends MMELObject {
  schema: string;
  author: string;
  title: string;
  shortname: string;
  edition: string;
  namespace: string;
}

export interface MMELReference extends MMELObject {
  id: string;
  document: string;
  clause: string;
  title: string;
}

export interface MMELProvision extends MMELObject {
  subject: Record<string, string>;
  id: string;
  modality: string;
  condition: string;
  ref: Set<string>;
}

export interface MMELRole extends MMELObject {
  id: string;
  name: string;
}

export interface MMELVariable extends MMELObject {
  id: string;
  type: VarType;
  definition: string;
  description: string;
}
