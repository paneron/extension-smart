import { MeasureDataList, MeasureDataUnit, MTreeNode } from "./unit"

export class CommparisonOperator {  
  id:string
  op: (a:MTreeNode, b:MTreeNode) => Boolean

  constructor(x:string, op: (a:MTreeNode, b:MTreeNode) => Boolean) {
    this.id = x
    this.op = op
  }
}

const GreaterOp = new CommparisonOperator(">", (a:MTreeNode, b:MTreeNode): Boolean => {  
  let result = true
  if (a instanceof MeasureDataUnit && b instanceof MeasureDataUnit) {
    let x = +a.value
    let y = +b.value
    result = x > y    
  } else if (a instanceof MeasureDataList && b instanceof MeasureDataUnit) {
    let v = +b.value
    for (let x of a.values) {
      let u = +x
      if (!(u > v)) {
        result = false
        return result
      }
    }    
  } else if (a instanceof MeasureDataUnit && b instanceof MeasureDataList) {
    let v = +a.value
    for (let x of b.values) {
      let u = +x
      if (!(v > u)) {
        result = false
        return result
      }
    }    
  } else if (a instanceof MeasureDataList && b instanceof MeasureDataList) {
    let max = a.values.length > b.values.length?a.values.length:b.values.length
    for (let i = 0;i < max;i++) {
      let x = +a.values[i%a.values.length]
      let y = +b.values[i%b.values.length]
      if (!(x > y)) {
        result = false
        return result
      }      
    }    
  }    
  return result
})

const GreaterEqOp = new CommparisonOperator(">=", (a:MTreeNode, b:MTreeNode): Boolean => {
  let result = true
  if (a instanceof MeasureDataUnit && b instanceof MeasureDataUnit) {
    let x = +a.value
    let y = +b.value
    result = x >= y    
  } else if (a instanceof MeasureDataList && b instanceof MeasureDataUnit) {
    let v = +b.value
    for (let x of a.values) {
      let u = +x
      if (!(u >= v)) {
        result = false
        return result
      }
    }    
  } else if (a instanceof MeasureDataUnit && b instanceof MeasureDataList) {
    let v = +a.value
    for (let x of b.values) {
      let u = +x
      if (!(v >= u)) {
        result = false
        return result
      }
    }    
  } else if (a instanceof MeasureDataList && b instanceof MeasureDataList) {
    let max = a.values.length > b.values.length?a.values.length:b.values.length
    for (let i = 0;i < max;i++) {
      let x = +a.values[i%a.values.length]
      let y = +b.values[i%b.values.length]
      if (!(x >= y)) {
        result = false
        return result
      }      
    }    
  }    
  return result
})

const EqualOp = new CommparisonOperator("=", (a:MTreeNode, b:MTreeNode): Boolean => {
  let result = true
  if (a instanceof MeasureDataUnit && b instanceof MeasureDataUnit) {
    let x = +a.value
    let y = +b.value
    result = x == y    
  } else if (a instanceof MeasureDataList && b instanceof MeasureDataUnit) {
    let v = +b.value
    for (let x of a.values) {
      let u = +x
      if (!(u == v)) {
        result = false
        return result
      }
    }    
  } else if (a instanceof MeasureDataUnit && b instanceof MeasureDataList) {
    let v = +a.value
    for (let x of b.values) {
      let u = +x
      if (!(v == u)) {
        result = false
        return result
      }
    }    
  } else if (a instanceof MeasureDataList && b instanceof MeasureDataList) {
    let max = a.values.length > b.values.length?a.values.length:b.values.length
    for (let i = 0;i < max;i++) {
      let x = +a.values[i%a.values.length]
      let y = +b.values[i%b.values.length]
      if (!(x == y)) {
        result = false
        return result
      }      
    }    
  }    
  return result
})

const LessOp = new CommparisonOperator("<", (a:MTreeNode, b:MTreeNode): Boolean => {  
  let result = true
  if (a instanceof MeasureDataUnit && b instanceof MeasureDataUnit) {
    let x = +a.value
    let y = +b.value
    result = x < y    
  } else if (a instanceof MeasureDataList && b instanceof MeasureDataUnit) {
    let v = +b.value
    for (let x of a.values) {
      let u = +x      
      if (!(u < v)) {
        result = false
        return result
      }
    }    
  } else if (a instanceof MeasureDataUnit && b instanceof MeasureDataList) {
    let v = +a.value
    for (let x of b.values) {
      let u = +x
      if (!(v < u)) {
        result = false
        return result
      }
    }    
  } else if (a instanceof MeasureDataList && b instanceof MeasureDataList) {
    let max = a.values.length > b.values.length?a.values.length:b.values.length
    for (let i = 0;i < max;i++) {
      let x = +a.values[i%a.values.length]
      let y = +b.values[i%b.values.length]
      if (!(x < y)) {
        result = false
        return result
      }      
    }    
  }    
  return result
})

const LessEqOp = new CommparisonOperator("<=", (a:MTreeNode, b:MTreeNode): Boolean => {
  let result = true
  if (a instanceof MeasureDataUnit && b instanceof MeasureDataUnit) {
    let x = +a.value
    let y = +b.value
    result = x <= y    
  } else if (a instanceof MeasureDataList && b instanceof MeasureDataUnit) {
    let v = +b.value
    for (let x of a.values) {
      let u = +x
      if (!(u <= v)) {
        result = false
        return result
      }
    }    
  } else if (a instanceof MeasureDataUnit && b instanceof MeasureDataList) {
    let v = +a.value
    for (let x of b.values) {
      let u = +x
      if (!(v <= u)) {
        result = false
        return result
      }
    }    
  } else if (a instanceof MeasureDataList && b instanceof MeasureDataList) {
    let max = a.values.length > b.values.length?a.values.length:b.values.length
    for (let i = 0;i < max;i++) {
      let x = +a.values[i%a.values.length]
      let y = +b.values[i%b.values.length]
      if (!(x <= y)) {
        result = false
        return result
      }      
    }    
  }    
  return result
})

function initOperators():Map<string, CommparisonOperator> {
  let map = new Map<string, CommparisonOperator>()
  let array = [GreaterOp, GreaterEqOp, EqualOp, LessOp, LessEqOp]
  array.forEach((x) => {
    map.set(x.id, x)
  })
  return map
}

export const ComparisonsOperators = initOperators()
