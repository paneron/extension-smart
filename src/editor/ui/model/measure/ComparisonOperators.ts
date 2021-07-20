import { MeasureDataList, MeasureDataUnit, MTreeNode } from './unit';

export class CommparisonOperator {
  id: string;
  op: (a: MTreeNode, b: MTreeNode) => Boolean;

  constructor(x: string, op: (a: MTreeNode, b: MTreeNode) => Boolean) {
    this.id = x;
    this.op = op;
  }
}

const GreaterOp = new CommparisonOperator(
  '>',
  (a: MTreeNode, b: MTreeNode): Boolean => {
    let result = true;
    if (a instanceof MeasureDataUnit && b instanceof MeasureDataUnit) {
      const x = +a.value;
      const y = +b.value;
      result = x > y;
    } else if (a instanceof MeasureDataList && b instanceof MeasureDataUnit) {
      const v = +b.value;
      for (const x of a.values) {
        const u = +x;
        if (!(u > v)) {
          result = false;
          return result;
        }
      }
    } else if (a instanceof MeasureDataUnit && b instanceof MeasureDataList) {
      const v = +a.value;
      for (const x of b.values) {
        const u = +x;
        if (!(v > u)) {
          result = false;
          return result;
        }
      }
    } else if (a instanceof MeasureDataList && b instanceof MeasureDataList) {
      const max =
        a.values.length > b.values.length ? a.values.length : b.values.length;
      for (let i = 0; i < max; i++) {
        const x = +a.values[i % a.values.length];
        const y = +b.values[i % b.values.length];
        if (!(x > y)) {
          result = false;
          return result;
        }
      }
    }
    return result;
  }
);

const GreaterEqOp = new CommparisonOperator(
  '>=',
  (a: MTreeNode, b: MTreeNode): Boolean => {
    let result = true;
    if (a instanceof MeasureDataUnit && b instanceof MeasureDataUnit) {
      const x = +a.value;
      const y = +b.value;
      result = x >= y;
    } else if (a instanceof MeasureDataList && b instanceof MeasureDataUnit) {
      const v = +b.value;
      for (const x of a.values) {
        const u = +x;
        if (!(u >= v)) {
          result = false;
          return result;
        }
      }
    } else if (a instanceof MeasureDataUnit && b instanceof MeasureDataList) {
      const v = +a.value;
      for (const x of b.values) {
        const u = +x;
        if (!(v >= u)) {
          result = false;
          return result;
        }
      }
    } else if (a instanceof MeasureDataList && b instanceof MeasureDataList) {
      const max =
        a.values.length > b.values.length ? a.values.length : b.values.length;
      for (let i = 0; i < max; i++) {
        const x = +a.values[i % a.values.length];
        const y = +b.values[i % b.values.length];
        if (!(x >= y)) {
          result = false;
          return result;
        }
      }
    }
    return result;
  }
);

const EqualOp = new CommparisonOperator(
  '=',
  (a: MTreeNode, b: MTreeNode): Boolean => {
    let result = true;
    if (a instanceof MeasureDataUnit && b instanceof MeasureDataUnit) {
      const x = +a.value;
      const y = +b.value;
      result = x === y;
    } else if (a instanceof MeasureDataList && b instanceof MeasureDataUnit) {
      const v = +b.value;
      for (const x of a.values) {
        const u = +x;
        if (!(u === v)) {
          result = false;
          return result;
        }
      }
    } else if (a instanceof MeasureDataUnit && b instanceof MeasureDataList) {
      const v = +a.value;
      for (const x of b.values) {
        const u = +x;
        if (!(v === u)) {
          result = false;
          return result;
        }
      }
    } else if (a instanceof MeasureDataList && b instanceof MeasureDataList) {
      const max =
        a.values.length > b.values.length ? a.values.length : b.values.length;
      for (let i = 0; i < max; i++) {
        const x = +a.values[i % a.values.length];
        const y = +b.values[i % b.values.length];
        if (!(x === y)) {
          result = false;
          return result;
        }
      }
    }
    return result;
  }
);

const LessOp = new CommparisonOperator(
  '<',
  (a: MTreeNode, b: MTreeNode): Boolean => {
    let result = true;
    if (a instanceof MeasureDataUnit && b instanceof MeasureDataUnit) {
      const x = +a.value;
      const y = +b.value;
      result = x < y;
    } else if (a instanceof MeasureDataList && b instanceof MeasureDataUnit) {
      const v = +b.value;
      for (const x of a.values) {
        const u = +x;
        if (!(u < v)) {
          result = false;
          return result;
        }
      }
    } else if (a instanceof MeasureDataUnit && b instanceof MeasureDataList) {
      const v = +a.value;
      for (const x of b.values) {
        const u = +x;
        if (!(v < u)) {
          result = false;
          return result;
        }
      }
    } else if (a instanceof MeasureDataList && b instanceof MeasureDataList) {
      const max =
        a.values.length > b.values.length ? a.values.length : b.values.length;
      for (let i = 0; i < max; i++) {
        const x = +a.values[i % a.values.length];
        const y = +b.values[i % b.values.length];
        if (!(x < y)) {
          result = false;
          return result;
        }
      }
    }
    return result;
  }
);

const LessEqOp = new CommparisonOperator(
  '<=',
  (a: MTreeNode, b: MTreeNode): Boolean => {
    let result = true;
    if (a instanceof MeasureDataUnit && b instanceof MeasureDataUnit) {
      const x = +a.value;
      const y = +b.value;
      result = x <= y;
    } else if (a instanceof MeasureDataList && b instanceof MeasureDataUnit) {
      const v = +b.value;
      for (const x of a.values) {
        const u = +x;
        if (!(u <= v)) {
          result = false;
          return result;
        }
      }
    } else if (a instanceof MeasureDataUnit && b instanceof MeasureDataList) {
      const v = +a.value;
      for (const x of b.values) {
        const u = +x;
        if (!(v <= u)) {
          result = false;
          return result;
        }
      }
    } else if (a instanceof MeasureDataList && b instanceof MeasureDataList) {
      const max =
        a.values.length > b.values.length ? a.values.length : b.values.length;
      for (let i = 0; i < max; i++) {
        const x = +a.values[i % a.values.length];
        const y = +b.values[i % b.values.length];
        if (!(x <= y)) {
          result = false;
          return result;
        }
      }
    }
    return result;
  }
);

function initOperators(): Map<string, CommparisonOperator> {
  const map = new Map<string, CommparisonOperator>();
  const array = [GreaterOp, GreaterEqOp, EqualOp, LessOp, LessEqOp];
  array.forEach(x => {
    map.set(x.id, x);
  });
  return map;
}

export const ComparisonsOperators = initOperators();
