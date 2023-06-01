import { DataType, MMELNode, MMELObject } from '@/interface/baseinterface';

// data structure for data attribute
export interface MMELDataAttribute extends MMELObject {
  id: string;
  type: string;
  modality: string;
  cardinality: string;
  definition: string;
  ref: Set<string>;
  datatype: DataType.DATAATTRIBUTE;
}

// data structure for data class
export interface MMELDataClass extends MMELNode {
  id: string;
  attributes: Record<string, MMELDataAttribute>;
  datatype: DataType.DATACLASS;
}

// data structure for enum value
export interface MMELEnumValue extends MMELObject {
  id: string;
  value: string;
  datatype: DataType.ENUMVALUE;
}

// data structure for enum
export interface MMELEnum extends MMELObject {
  id: string;
  values: Record<string, MMELEnumValue>;
  datatype: DataType.ENUM;
}

// data structure for Registry
export interface MMELRegistry extends MMELNode {
  title: string;
  data: string; // ID of the underlying data class
  datatype: DataType.REGISTRY;
}
