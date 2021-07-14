import { MMELNode, MMELObject } from './baseinterface';
import { MMELReference } from './supportinterface';

// data structure for data attribute
export interface MMELDataAttribute extends MMELObject {
  id: string;
  type: string;
  modality: string;
  cardinality: string;
  definition: string;
  ref: Array<MMELReference>;
  satisfy: Array<string>;
}

// temporary data container for holding unprocessed reference IDs before resolving
export interface ParsingDataAttribute {
  content: MMELDataAttribute;
  p_ref: Array<string>;
}

// data structure for data class
export interface MMELDataClass extends MMELNode {
  attributes: Array<MMELDataAttribute>;
}

// temporary data container for holding unprocessed attribute IDs before resolving
export interface ParsingDataClass {
  content: MMELDataClass;
  p_attribute: Array<ParsingDataAttribute>;
}

// data structure for enum value
export interface MMELEnumValue extends MMELObject {
  id: string;
  value: string;
}

// data structure for enum
export interface MMELEnum extends MMELObject {
  id: string;
  values: Array<MMELEnumValue>;
}

// data structure for Registry
export interface MMELRegistry extends MMELNode {
  title: string;
  data: MMELDataClass | null;
}

// temporary data container for holding unprocessed dataclass IDs before resolving
export interface ParsingRegistry {
  content: MMELRegistry;
  p_dataclass: string;
}
