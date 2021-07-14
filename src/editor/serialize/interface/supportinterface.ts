import { MMELObject } from './baseinterface';

export interface MMELMetadata extends MMELObject {
  schema: string;
  author: string;
  title: string;
  edition: string;
  namespace: string;
}

export interface MMELProvision extends MMELObject {
  subject: Map<string, string>;
  id: string;
  modality: string;
  condition: string;
  ref: Array<MMELReference>;
}

export interface ParsingProvision {
  content: MMELProvision;
  p_ref: Array<string>;
}

export interface MMELReference extends MMELObject {
  id: string;
  document: string;
  clause: string;
}

export interface MMELRole extends MMELObject {
  id: string;
  name: string;
}

export interface MMELVariable extends MMELObject {
  id: string;
  type: string;
  definition: string;
  description: string;
}
