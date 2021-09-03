import {
  EnviromentValues,
  EnviromentVariables,
  MTreeNode,
} from '../../model/Measurement';
import { createMTreeNodeWithValue } from './BasicFunctions';
import { getListFromNode, getValueFromNode } from './Evaluator';

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

export type Comparator = (a: number, b: number) => boolean;

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

export const MListOperators = ['sum', 'max', 'min'] as const;

export const MBinaryOperators = ['+', '-', '*', '/'] as const;

// must place >= before >
export const comparators = ['>=', '<=', '=', '>', '<'] as const;

export type MListOperatorTypes = typeof MListOperators[number];
export type MBinOperatorTypes = typeof MBinaryOperators[number];
export type MComparatorTypes = typeof comparators[number];

export const MLOperators: Record<MListOperatorTypes, ListOperator> = {
  sum: SumListOp,
  max: MaxListOp,
  min: MinListOp,
};

export const MBOperators: Record<MBinOperatorTypes, BinaryOperator> = {
  '+': PlusOp,
  '-': MinusOp,
  '*': MulOp,
  '/': DivideOp,
};

export const MComparison: Record<MComparatorTypes, Comparator> = {
  '>=': (a, b) => a >= b,
  '<=': (a, b) => a <= b,
  '=': (a, b) => a === b,
  '>': (a, b) => a > b,
  '<': (a, b) => a < b,
};
