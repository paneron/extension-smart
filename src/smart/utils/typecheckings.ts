import type { EditorNode } from '@/smart/model/editormodel';
import { isEditorDataClass } from '@/smart/model/editormodel';
import type { DataType } from '@paneron/libmmel/interface/baseinterface';
import type { MMELEnum } from '@paneron/libmmel/interface/datainterface';
import type {
  BASICTYPES,
  SearchableNodeTypes } from '@/smart/utils/constants';
import {
  DATATYPE,
  searchableNodeDataTypes
} from '@/smart/utils/constants';

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
