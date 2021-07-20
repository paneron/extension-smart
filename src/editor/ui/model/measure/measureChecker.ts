import { VarType } from '../../../runtime/idManager';
import { DataType } from '../../../serialize/interface/baseinterface';
import {
  MMELEdge,
  MMELSubprocess,
  MMELSubprocessComponent,
} from '../../../serialize/interface/flowcontrolinterface';
import { MMELProcess } from '../../../serialize/interface/processinterface';
import { functionCollection } from '../../util/function';
import { ComparisonsOperators } from './ComparisonOperators';
import {
  BinaryOperator,
  ListOperator,
  MeasurementOperators,
} from './measureOperator';
import {
  MeasureDataList,
  MeasureDataUnit,
  MTreeNode,
  NodeRef,
  NodeType,
} from './unit';

export enum MeasureRType {
  OK,
  ERRORSOURCE,
  CONTAINERROR,
}

export class MeasureChecker {
  static markResult(
    input: Set<MMELSubprocessComponent>,
    choice: Map<MMELSubprocessComponent, MMELSubprocessComponent>
  ): Map<string, MeasureRType> {
    const result = new Map<string, MeasureRType>();
    const sm = functionCollection.getStateMan();
    const mw = sm.state.modelWrapper;
    const model = sm.state.modelWrapper.model;
    if (model.root !== null) {
      const start = mw.subman.get(model.root).start;
      if (start !== null) {
        markNode(start, model.root, input, result, choice);
      }
    }
    return result;
  }

  static resolveValues(values: Map<string, string>): Map<string, MTreeNode> {
    const functions = new Map<string, MTreeNode>();
    const sm = functionCollection.getStateMan();
    const model = sm.state.modelWrapper.model;
    for (const v of model.vars) {
      if (v.type === VarType.DATA) {
        const r = values.get(v.id);
        if (r !== undefined) {
          functions.set(v.id, new MeasureDataUnit(v.id, r));
        }
      } else if (v.type === VarType.LISTDATA) {
        const r = values.get(v.id);
        if (r !== undefined) {
          functions.set(v.id, new MeasureDataList(v.id, r.split(',')));
        }
      } else if (v.type === VarType.DERIVED) {
        functions.set(v.id, parseMeasurement(functions, v.definition));
      } else {
        console.debug('Error! Unknown measurement type', v);
      }
    }

    // parsing done
    // now resolve the formulae
    functions.forEach((node, key) => {
      if (node instanceof NodeRef) {
        resolve(node, key, functions);
      }
    });

    console.debug('Debug message: calculated values', functions);
    // put back to the values store
    functions.forEach((node, key) => {
      if (node instanceof MeasureDataUnit) {
        values.set(key, node.value);
      } else if (node instanceof MeasureDataList) {
        values.set(key, node.values.join(','));
      }
    });

    return functions;
  }

  static examineModel(
    values: Map<string, MTreeNode>
  ): [
    Set<MMELSubprocessComponent>,
    Map<MMELSubprocessComponent, MMELSubprocessComponent>
  ] {
    const sm = functionCollection.getStateMan();
    const mw = sm.state.modelWrapper;
    const model = sm.state.modelWrapper.model;
    const visited = new Map<MMELSubprocessComponent, Boolean>();
    const pathchoice = new Map<
      MMELSubprocessComponent,
      MMELSubprocessComponent
    >();
    const dead = new Set<MMELSubprocessComponent>();
    if (model.root !== null) {
      const start = mw.subman.get(model.root).start;
      if (start !== null) {
        if (verifyNode(start, values, visited, dead, pathchoice)) {
          alert('Measurement test passed');
        } else {
          alert('Measurement test failed');
        }
      }
    }
    return [dead, pathchoice];
  }
}

function markNode(
  x: MMELSubprocessComponent,
  page: MMELSubprocess,
  dead: Set<MMELSubprocessComponent>,
  result: Map<string, MeasureRType>,
  choice: Map<MMELSubprocessComponent, MMELSubprocessComponent>
): boolean {
  const mw = functionCollection.getStateMan().state.modelWrapper;
  let ret = true;
  if (x.element !== null) {
    const id = page.id + ' ' + x.element.id;
    if (!result.has(id)) {
      if (dead.has(x)) {
        result.set(id, MeasureRType.ERRORSOURCE);
        return false;
      }
      if (x.element.datatype === DataType.PROCESS) {
        const p = x.element as MMELProcess;
        if (p.page !== null) {
          const start = mw.subman.get(p.page).start;
          if (start !== null) {
            if (!markNode(start, p.page, dead, result, choice)) {
              result.set(id, MeasureRType.CONTAINERROR);
              return false;
            }
          }
        }
      }
      result.set(id, MeasureRType.OK);
      if (x.element.datatype === DataType.EGATE) {
        const go = choice.get(x);
        if (go === undefined) {
          ret = false;
          for (const c of mw.comman.get(x).child) {
            if (c.to !== null) {
              const x = markNode(c.to, page, dead, result, choice);
              ret = x || ret;
            }
          }
        } else {
          // go to exactly one path
          ret = markNode(go, page, dead, result, choice);
        }
      } else {
        for (const c of mw.comman.get(x).child) {
          if (c.to !== null) {
            const x = markNode(c.to, page, dead, result, choice);
            ret = ret && x;
          }
        }
      }
    } else {
      const r = result.get(id);
      if (r === MeasureRType.OK) {
        return true;
      } else {
        return false;
      }
    }
  }
  return ret;
}

function verifyNode(
  x: MMELSubprocessComponent,
  values: Map<string, MTreeNode>,
  visited: Map<MMELSubprocessComponent, Boolean>,
  dead: Set<MMELSubprocessComponent>,
  choice: Map<MMELSubprocessComponent, MMELSubprocessComponent>
): Boolean {
  const mw = functionCollection.getStateMan().state.modelWrapper;
  const y = visited.get(x);
  if (y !== undefined) {
    return y;
  }
  let result: Boolean = true;
  visited.set(x, result);
  if (x.element?.datatype === DataType.PROCESS) {
    const p = x.element as MMELProcess;
    p.measure.map(m => {
      if (!validateCondition(m, values)) {
        dead.add(x);
        result = false;
      }
    });
    if (p.page !== null) {
      const start = mw.subman.get(p.page).start;
      if (start !== null) {
        result = verifyNode(start, values, visited, dead, choice);
      }
    }
  }
  if (x.element?.datatype === DataType.EGATE) {
    const addon = mw.comman.get(x);
    let alldefined = addon.child.length > 0;
    for (const c of addon.child) {
      if (c.condition === '') {
        alldefined = false;
      }
    }
    if (!alldefined) {
      result = addon.child.length === 0;
      for (const c of addon.child) {
        if (c.to !== null) {
          if (verifyNode(c.to, values, visited, dead, choice)) {
            result = true;
          }
        }
      }
    } else {
      // go to exactly one path
      const go = findNext(x, values);
      choice.set(x, go);
      result = verifyNode(go, values, visited, dead, choice);
    }
  } else {
    const addon = mw.comman.get(x);
    for (const c of addon.child) {
      if (c.to !== null) {
        if (!verifyNode(c.to, values, visited, dead, choice)) {
          result = false;
        }
      }
    }
  }
  visited.set(x, result);
  return result;
}

function validateCondition(
  cond: string,
  values: Map<string, MTreeNode>
): Boolean {
  let para1 = '';
  let para2 = '';
  let op = '';
  if (cond.indexOf('>=') !== -1) {
    const x = cond.indexOf('>=');
    console.debug(x);
    para1 = cond.substr(0, x).trim();
    op = cond.substr(x, 2);
    para2 = cond.substr(x + 2).trim();
  } else if (cond.indexOf('<=') !== -1) {
    const x = cond.indexOf('<=');
    console.debug(x);
    para1 = cond.substr(0, x).trim();
    op = cond.substr(x, 2);
    para2 = cond.substr(x + 2).trim();
  } else if (cond.indexOf('=') !== -1) {
    const x = cond.indexOf('=');
    console.debug(x);
    para1 = cond.substr(0, x).trim();
    op = cond.substr(x, 1);
    para2 = cond.substr(x + 1).trim();
  } else if (cond.indexOf('>') !== -1) {
    const x = cond.indexOf('>');
    para1 = cond.substr(0, x).trim();
    op = cond.substr(x, 1);
    para2 = cond.substr(x + 1).trim();
  } else if (cond.indexOf('<') !== -1) {
    const x = cond.indexOf('<');
    para1 = cond.substr(0, x).trim();
    op = cond.substr(x, 1);
    para2 = cond.substr(x + 1).trim();
  }
  const pattern = /\[.*?\]/;
  let x, y;
  if (pattern.test(para1)) {
    x = values.get(para1.substr(1, para1.length - 2));
  } else {
    x = new MeasureDataUnit('', para1);
  }
  if (pattern.test(para2)) {
    y = values.get(para2.substr(1, para2.length - 2));
  } else {
    y = new MeasureDataUnit('', para2);
  }
  if (x instanceof MTreeNode && y instanceof MTreeNode) {
    const operator = ComparisonsOperators.get(op);
    if (operator === undefined) {
      console.error('Operator cannot be resolved', op);
    } else {
      return operator.op(x, y);
    }
  } else {
    console.error('Parameters format not correct', x, y);
  }
  return true;
}

function findNext(
  x: MMELSubprocessComponent,
  values: Map<string, MTreeNode>
): MMELSubprocessComponent {
  const mw = functionCollection.getStateMan().state.modelWrapper;
  const addon = mw.comman.get(x);
  let go: MMELEdge = addon.child[0];
  for (const c of addon.child) {
    if (c.condition === 'default') {
      go = c;
    }
  }
  for (const c of addon.child) {
    if (c.condition !== 'default') {
      if (validateCondition(c.condition, values)) {
        go = c;
      }
    }
  }
  if (go.to !== null) {
    return go.to;
  }
  return x;
}

function resolve(n: NodeRef, key: string, functions: Map<string, MTreeNode>) {
  const ret = resolveNode(n, functions);
  functions.set(key, ret);
}

function resolveNode(n: NodeRef, functions: Map<string, MTreeNode>): MTreeNode {
  if (n.type === NodeType.DATA) {
    const x = functions.get(n.id);
    if (x === undefined) {
      console.error('Measurement cannot be resolved', n.id);
    } else {
      if (x instanceof NodeRef) {
        resolve(x, n.id, functions);
        const y = functions.get(n.id);
        if (y !== undefined) {
          return y;
        }
      } else {
        return x;
      }
    }
  } else if (n.type === NodeType.LISTOP) {
    const op = MeasurementOperators.get(n.id);
    if (op === undefined) {
      console.error('Operator cannot be resolved', n.id);
    } else if (op instanceof ListOperator) {
      if (n.childs.length !== 1) {
        console.error('Number of parameter is not 1', n.id, op);
      } else {
        let c = n.childs[0];
        if (c instanceof NodeRef) {
          c = resolveNode(c, functions);
        }
        if (c instanceof MeasureDataList) {
          const result = op.op(c);
          return result;
        } else {
          console.error('Expecting a list as a parameter', n.id, op, c);
        }
      }
    } else {
      console.error('Operator is not a list operator', n.id, op);
    }
  } else if (n.type === NodeType.BINOP) {
    const op = MeasurementOperators.get(n.id);
    if (op === undefined) {
      console.error('Operator cannot be resolved', n.id);
    } else if (op instanceof BinaryOperator) {
      if (n.childs.length !== 2) {
        console.error('Number of parameter is not 2', n.id, op);
      } else {
        let c1 = n.childs[0];
        let c2 = n.childs[1];
        if (c1 instanceof NodeRef) {
          c1 = resolveNode(c1, functions);
        }
        if (c2 instanceof NodeRef) {
          c2 = resolveNode(c2, functions);
        }
        return op.op(c1, c2);
      }
    } else {
      console.error('Operator is not a binary operator', n.id, op);
    }
  }
  console.error('Error. Case not handled', n);
  return new MTreeNode('dummy');
}

function parseMeasurement(f: Map<string, MTreeNode>, x: string): MTreeNode {
  const tokens = tokenize(x);
  const stack: Array<MTreeNode> = [];
  // first merge only the list operators
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    if (t.type === NodeType.DATA) {
      stack.push(new NodeRef(t.ref, t.type));
    } else if (t.type === NodeType.LISTOP) {
      const z = stack.pop();
      if (z === undefined) {
        console.error('No data for list operator', t, x, tokens);
      } else {
        const nn = new NodeRef(t.ref, t.type);
        nn.childs.push(z);
        stack.push(nn);
      }
    } else if (t.type === NodeType.BINOP) {
      stack.push(new NodeRef(t.ref, t.type));
    }
  }
  const stack2: Array<MTreeNode> = [];
  // second, process and merge binary operators
  for (let i = 0; i < stack.length; i++) {
    const node = stack[i];
    if (node instanceof NodeRef && node.type === NodeType.BINOP) {
      const z = stack2.pop();
      i++;
      if (z === undefined) {
        console.error(
          'No first data for binar operator',
          node,
          x,
          tokens,
          stack
        );
      } else if (i < stack.length) {
        const second = stack[i];
        node.childs.push(z);
        node.childs.push(second);
        stack2.push(node);
      } else {
        console.error(
          'No second data for binary operator',
          node,
          x,
          tokens,
          stack
        );
      }
    } else {
      stack2.push(node);
    }
  }
  if (stack2.length !== 1) {
    console.error(
      'The parse result is not a single operation tree!',
      x,
      tokens,
      stack
    );
  }
  return stack2[0];
}

function tokenize(x: string): Array<Token> {
  const out: Array<Token> = [];
  for (let i = 0; i < x.length; i++) {
    const c = x[i];
    if (/\s/.test(c)) {
      // space, do nothing
    } else if (c === '[') {
      // a measurement reference
      i++;
      let name = '';
      while (i < x.length && x[i] !== ']') {
        name += x[i];
        i++;
      }
      out.push({ ref: name, type: NodeType.DATA });
    } else if (c === '.') {
      // a list operator
      i++;
      let name = '';
      while (i < x.length && !/\s/.test(x[i])) {
        name += x[i];
        i++;
      }
      out.push({ ref: name, type: NodeType.LISTOP });
    } else if (/[\+\-\*/]/.test(c)) {
      // a binary operator
      out.push({ ref: c, type: NodeType.BINOP });
    } else {
      console.debug('Unknown tokens', c);
    }
  }
  return out;
}

interface Token {
  ref: string;
  type: NodeType;
}
