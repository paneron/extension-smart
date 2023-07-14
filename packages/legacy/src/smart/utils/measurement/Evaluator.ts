import {
  EnviromentValues,
  EnviromentVariables,
  MTestReport,
  MTreeNode,
} from '@/smart/model/Measurement';
import { isBinaryOperator, isListOperator } from '@/smart/utils/measurement/BasicFunctions';
import { MBOperators, MComparison, MLOperators } from '@/smart/utils/measurement/Operators';
import { parseCondition } from '@/smart/utils/measurement/Parser';

export function getFinalValueFromNode(a: MTreeNode): string | number {
  if (Array.isArray(a.value)) {
    return a.value[0];
  } else {
    return a.value;
  }
}

export function getValueFromNode(
  a: MTreeNode,
  values: EnviromentValues,
  trees: EnviromentVariables
): number {
  if (a.isData && a.action === '') {
    if (Array.isArray(a.value)) {
      return a.value[0];
    } else {
      throw `Not a numeric data: ${a}`;
    }
  }
  return getValueFromNode(resolveMTNode(a, values, trees), values, trees);
}

export function getListFromNode(
  a: MTreeNode,
  values: EnviromentValues,
  trees: EnviromentVariables
): number[] {
  if (a.isData && a.action === '') {
    if (Array.isArray(a.value)) {
      return a.value;
    } else {
      throw `Not a list: ${a}`;
    }
  }
  return getListFromNode(resolveMTNode(a, values, trees), values, trees);
}

export function resolveMTNode(
  a: MTreeNode,
  values: EnviromentValues,
  trees: EnviromentVariables
): MTreeNode {
  if (a.isData) {
    if (
      a.action === '' &&
      (typeof a.value === 'string' || a.value.length > 0)
    ) {
      return a;
    }
    const v = values[a.action];
    if (v === undefined) {
      const tree = trees[a.action];
      if (tree !== undefined) {
        const resolved = resolveMTNode(tree, values, trees);
        values[a.action] = resolved.value;
        return resolved;
      }
      throw `Unknown variable ${a.action}`;
    }
    return { ...a, action : '', value : v };
  }
  if (isListOperator(a.action)) {
    const op = MLOperators[a.action];
    if (a.childs.length < 1) {
      throw `No parameter to list operation ${a.action}`;
    }
    return op(a.childs[0], values, trees);
  } else if (isBinaryOperator(a.action)) {
    const op = MBOperators[a.action];
    if (a.childs.length < 2) {
      throw `Not enough parameters to binary operation ${a.action}`;
    }
    return op(a.childs[0], a.childs[1], values, trees);
  }
  throw `Unknown operator ${a.action}`;
}

export function evaluateCondition(
  cond: string,
  values: EnviromentValues,
  report: MTestReport,
  reportTitle: string
): boolean {
  const [left, op, right] = parseCondition(cond);
  const a = getFinalValueFromNode(resolveMTNode(left, values, {}));
  const b = getFinalValueFromNode(resolveMTNode(right, values, {}));
  const result = MComparison[op](a, b);
  report.push({
    cond,
    left        : a,
    right       : b,
    result,
    description : reportTitle,
  });
  return result;
}
