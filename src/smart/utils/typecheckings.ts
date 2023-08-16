import { EditorNode, isEditorDataClass } from '@/smart/model/editormodel';
import { DataType } from '@paneron/libmmel/interface/baseinterface';
import { MMELEnum } from '@paneron/libmmel/interface/datainterface';
import {
  BASICTYPES,
  DATATYPE,
  searchableNodeDataTypes,
  SearchableNodeTypes,
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
