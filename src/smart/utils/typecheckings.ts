import { DataType } from '../serialize/interface/baseinterface';
import { searchableNodeDataTypes, SearchableNodeTypes } from './constants';

export function isSearchableNodeTypes(x: DataType): x is SearchableNodeTypes {
  for (const type of searchableNodeDataTypes) {
    if (type === x) {
      return true;
    }
  }
  return false;
}
