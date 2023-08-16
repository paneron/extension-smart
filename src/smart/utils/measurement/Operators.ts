import {
  EnviromentValues,
  EnviromentVariables,
  MTreeNode,
} from '@/smart/model/Measurement';
import { createMTreeNodeWithValue } from '@/smart/utils/measurement/BasicFunctions';
import { getListFromNode, getValueFromNode } from '@/smart/utils/measurement/Evaluator';

export type BinaryOperator = (
  a: MTreeNode,
  b: MTreeNode,
  values: EnviromentValues,
  trees: EnviromentVariables
) => MTreeNode;

export type ListOperator = (
  a: MTreeNode,
  values: EnviromentValues,
  trees: EnviromentVariables
) => MTreeNode;

export type Comparator = (a: number | string, b: number | string) => boolean;

const SumListOp: ListOperator = function (
  a: MTreeNode,
  values: EnviromentValues,
  trees: EnviromentVariables
) {
  const list = getListFromNode(a, values, trees);
  return createMTreeNodeWithValue([list.reduce((sum, v) => sum + v, 0)]);
};

const MaxListOp: ListOperator = function (
  a: MTreeNode,
  values: EnviromentValues,
  trees: EnviromentVariables
) {
  const list = getListFromNode(a, values, trees);
  return createMTreeNodeWithValue([
    list.reduce((max, v) => (v > max ? v : max)),
  ]);
};

const MinListOp: ListOperator = function (
  a: MTreeNode,
  values: EnviromentValues,
  trees: EnviromentVariables
) {
  const list = getListFromNode(a, values, trees);
  return createMTreeNodeWithValue([
    list.reduce((min, v) => (v < min ? v : min)),
  ]);
};

const CountListOp: ListOperator = function (
  a: MTreeNode,
  values: EnviromentValues,
  trees: EnviromentVariables
) {
  const list = getListFromNode(a, values, trees);
  return createMTreeNodeWithValue([list.length]);
};

const AverageListOp: ListOperator = function (
  a: MTreeNode,
  values: EnviromentValues,
  trees: EnviromentVariables
) {
  const list = getListFromNode(a, values, trees);
  return createMTreeNodeWithValue([
    list.length > 0 ? list.reduce((sum, v) => sum + v, 0) / list.length : 0,
  ]);
};

const PlusOp: BinaryOperator = function (
  a: MTreeNode,
  b: MTreeNode,
  values: EnviromentValues,
  trees: EnviromentVariables
) {
  const left = getValueFromNode(a, values, trees);
  const right = getValueFromNode(b, values, trees);
  return createMTreeNodeWithValue([left + right]);
};

const MinusOp: BinaryOperator = function (
  a: MTreeNode,
  b: MTreeNode,
  values: EnviromentValues,
  trees: EnviromentVariables
) {
  const left = getValueFromNode(a, values, trees);
  const right = getValueFromNode(b, values, trees);
  return createMTreeNodeWithValue([left - right]);
};

const MulOp: BinaryOperator = function (
  a: MTreeNode,
  b: MTreeNode,
  values: EnviromentValues,
  trees: EnviromentVariables
) {
  const left = getValueFromNode(a, values, trees);
  const right = getValueFromNode(b, values, trees);
  return createMTreeNodeWithValue([left * right]);
};

const DivideOp: BinaryOperator = function (
  a: MTreeNode,
  b: MTreeNode,
  values: EnviromentValues,
  trees: EnviromentVariables
) {
  const left = getValueFromNode(a, values, trees);
  const right = getValueFromNode(b, values, trees);
  return createMTreeNodeWithValue([left / right]);
};

export const MListOperators = [
  'sum',
  'max',
  'min',
  'count',
  'average',
] as const;

export const MBinaryOperators = ['+', '-', '*', '/'] as const;

// must place >= before >
export const MComparators = ['>=', '<=', '=', '>', '<'] as const;

export type MListOperatorTypes = typeof MListOperators[number];
export type MBinOperatorTypes = typeof MBinaryOperators[number];
export type MComparatorTypes = typeof MComparators[number];

export const MLOperators: Record<MListOperatorTypes, ListOperator> = {
  sum     : SumListOp,
  max     : MaxListOp,
  min     : MinListOp,
  count   : CountListOp,
  average : AverageListOp,
};

export const MBOperators: Record<MBinOperatorTypes, BinaryOperator> = {
  '+' : PlusOp,
  '-' : MinusOp,
  '*' : MulOp,
  '/' : DivideOp,
};

export const MComparison: Record<MComparatorTypes, Comparator> = {
  '>=' : (a, b) => a >= b,
  '<=' : (a, b) => a <= b,
  '='  : (a, b) => a === b,
  '>'  : (a, b) => a > b,
  '<'  : (a, b) => a < b,
};
