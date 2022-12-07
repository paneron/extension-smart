import { EditorNode, isEditorDataClass } from '../model/editormodel';
import { DataType } from '../serialize/interface/baseinterface';
import { MMELEnum } from '../serialize/interface/datainterface';
import {
  BASICTYPES,
  DATATYPE,
  searchableNodeDataTypes,
  SearchableNodeTypes,
} from './constants';

export function isSearchableNodeTypes(x: DataType): x is SearchableNodeTypes {
  for (const type of searchableNodeDataTypes) {
    if (type === x) {
      return true;
    }
  }
  return false;
}

export function isBasicType(type: string): type is BASICTYPES {
  for (const t of DATATYPE) {
    if (type === t) {
      return true;
    }
  }
  return false;
}

export function isEnum(type: string, enums: Record<string, MMELEnum>): boolean {
  return enums[type] !== undefined;
}

export function isDCClass(
  type: string,
  elements: Record<string, EditorNode>
): boolean {
  const elm = elements[type];
  return elm !== undefined && isEditorDataClass(elm);
}
