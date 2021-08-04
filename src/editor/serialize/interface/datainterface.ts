import { MMELNode, MMELObject } from './baseinterface';

// data structure for data attribute
export interface MMELDataAttribute extends MMELObject {
  id: string;
  type: string;
  modality: string;
  cardinality: string;
  definition: string;
  ref: Set<string>;
  satisfy: Set<string>;
}

// data structure for data class
export interface MMELDataClass extends MMELNode {
  attributes: Record<string, MMELDataAttribute>;
}

// data structure for enum value
export interface MMELEnumValue extends MMELObject {
  id: string;
  value: string;
}

// data structure for enum
export interface MMELEnum extends MMELObject {
  id: string;
  values: Record<string, MMELEnumValue>;
}

// data structure for Registry
export interface MMELRegistry extends MMELNode {
  title: string;
  data: string;
}
