import { MTreeNode } from '../../model/Measurement';
import { MMELVariable } from '../../serialize/interface/supportinterface';
import {
  MBinaryOperators,
  MBinOperatorTypes,
  MListOperators,
  MListOperatorTypes,
} from './Operators';

export function measurementValidCheck(
  def: string,
  types: Record<string, MMELVariable>
) {
  const results = Array.from(def.matchAll(/\[.*?\]/g));
  let ok = true;
  for (const r of results) {
    const name = r[0].substring(1, r[0].length - 1);
    if (types[name] === undefined) {
      alert(name + ' is not a measurement');
      ok = false;
    }
  }
  if (ok) {
    alert('All measurement names can be resolved');
  }
}

export function isListOperator(c: string): c is MListOperatorTypes {
  for (const t of MListOperators) {
    if (c === t) {
      return true;
    }
  }
  return false;
}

export function isBinaryOperator(c: string): c is MBinOperatorTypes {
  for (const t of MBinaryOperators) {
    if (c === t) {
      return true;
    }
  }
  return false;
}

export function createMTreeNodeWithValue(value: number[] | string): MTreeNode {
  return {
    action : '',
    isData : true,
    childs : [],
    value,
  };
}

export function createMTreeNodeWithOperator(
  action: string,
  childs: MTreeNode[]
): MTreeNode {
  return {
    action,
    isData : false,
    childs,
    value  : [],
  };
}

export function createMTreeNodeWithVariable(action: string): MTreeNode {
  return {
    action,
    isData : true,
    childs : [],
    value  : [],
  };
}
