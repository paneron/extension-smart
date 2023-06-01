import { MTreeNode } from '@/smart/model/Measurement';
import { isSpace } from '@/smart/utils/parser_helpers';
import {
  createMTreeNodeWithOperator,
  createMTreeNodeWithValue,
  createMTreeNodeWithVariable,
  isBinaryOperator,
  isListOperator,
} from './BasicFunctions';
import { MComparators, MComparatorTypes } from '@/smart/utils/measurement/Operators';

export interface MToken {
  text: string;
  isData: boolean;
  value: number | string;
}

function mTokenize(x: string): MToken[] {
  const out: MToken[] = [];
  for (let i = 0; i < x.length; i++) {
    const c = x[i];
    if (isSpace(c)) {
      // space, do nothing
    } else if (c === "'") {
      // a string
      i++;
      let data = '';
      while (i < x.length && x[i] !== "'") {
        data += x[i];
        i++;
      }
      out.push({ text : '', isData : true, value : data });
    } else if (c === '[') {
      // a measurement reference
      i++;
      let name = '';
      while (i < x.length && x[i] !== ']') {
        name += x[i];
        i++;
      }
      out.push({ text : name, isData : true, value : 0 });
    } else if (c === '.') {
      // a list operator
      i++;
      let name = '';
      while (i < x.length && !isSpace(x[i])) {
        name += x[i];
        i++;
      }
      out.push({ text : name, isData : false, value : 0 });
    } else if (isBinaryOperator(c)) {
      // a binary operator
      out.push({ text : c, isData : false, value : 0 });
    } else {
      // a constant
      i++;
      let value = c;
      while (i < x.length && !isSpace(x[i])) {
        value += x[i];
        i++;
      }
      out.push({ text : '', isData : true, value : parseFloat(value) });
    }
  }
  return out;
}

export function parseMeasurement(x: string): MTreeNode {
  const tokens = mTokenize(x);
  const stack: MTreeNode[] = [];
  // first merge only the list operators
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    if (t.isData) {
      if (t.text === '') {
        stack.push(
          createMTreeNodeWithValue(
            typeof t.value === 'string' ? t.value : [t.value]
          )
        );
      } else {
        stack.push(createMTreeNodeWithVariable(t.text));
      }
    } else {
      if (isListOperator(t.text)) {
        const para = stack.pop();
        if (para === undefined || !para.isData) {
          throw `No data for list operator ${t.text}`;
        }
        stack.push(createMTreeNodeWithOperator(t.text, [para]));
      } else {
        stack.push(createMTreeNodeWithOperator(t.text, []));
      }
    }
  }
  const stack2: MTreeNode[] = [];
  // second, process and merge binary operators
  for (let i = 0; i < stack.length; i++) {
    const node = stack[i];
    if (!node.isData && isBinaryOperator(node.action)) {
      const left = stack2.pop();
      if (left === undefined) {
        throw `No first data for binar operator ${node.action}`;
      }
      i++;
      if (i < stack.length) {
        const right = stack[i];
        node.childs = [left, right];
        stack2.push(node);
      } else {
        throw `No second data for binary operator ${node.action}`;
      }
    } else {
      stack2.push(node);
    }
  }
  if (stack2.length !== 1) {
    throw `The parse result of ${x} is not a single operation tree! It has ${stack2.length} elements. Token size: ${tokens.length}. Stack size: ${stack.length}`;
  }
  return stack2[0];
}

function sliceCondition(
  cond: string,
  token: MComparatorTypes
): [MTreeNode, MComparatorTypes, MTreeNode] {
  const index = cond.indexOf(token);
  const left = cond.substring(0, index).trim();
  const right = cond.substring(index + token.length).trim();
  return [parseMeasurement(left), token, parseMeasurement(right)];
}

export function parseCondition(
  cond: string
): [MTreeNode, MComparatorTypes, MTreeNode] {
  for (const op of MComparators) {
    if (cond.includes(op)) {
      return sliceCondition(cond, op);
    }
  }
  throw `Condition format is not correct: ${cond}`;
}
