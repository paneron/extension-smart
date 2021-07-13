import { Edge } from "../../../model/model/flow/edge";
import { Subprocess, SubprocessComponent } from "../../../model/model/flow/subprocess";
import { EGate } from "../../../model/model/gate/egate";
import { VarType } from "../../../model/model/measure/variable";
import { Process } from "../../../model/model/process/process";
import { functionCollection } from "../../util/function";
import { ComparisonsOperators } from "./ComparisonOperators";
import { BinaryOperator, ListOperator, MeasurementOperators } from "./measureOperator";
import { MeasureDataList, MeasureDataUnit, MTreeNode, NodeRef, NodeType } from "./unit";

export enum MeasureRType {
  OK,
  ERRORSOURCE,
  CONTAINERROR
}

export class MeasureChecker {
  static markResult(input: Set<SubprocessComponent>, choice: Map<SubprocessComponent, SubprocessComponent>):Map<string, MeasureRType> {
    let result = new Map<string, MeasureRType>()
    let sm = functionCollection.getStateMan()
    let model = sm.state.modelWrapper.model    
    if (model.root != null && model.root.start != null) {
      markNode(model.root.start, model.root, input, result, choice)
    }
    return result
  }  

  static resolveValues(values: Map<string, string>): Map<string, MTreeNode> {
    let functions = new Map<string, MTreeNode>()
    let sm = functionCollection.getStateMan()
    let model = sm.state.modelWrapper.model
    for (let v of model.vars) {
      if (v.type == VarType.DATA) {
        let r = values.get(v.id)
        if (r != undefined) {
          functions.set(v.id, new MeasureDataUnit(v.id, r))
        }
      } else if (v.type == VarType.LISTDATA) {
        let r = values.get(v.id)
        if (r != undefined) {
          functions.set(v.id, new MeasureDataList(v.id, r.split(",")))
        }
      } else if (v.type == VarType.DERIVED) {
        functions.set(v.id, parseMeasurement(functions, v.definition))
      } else {
        console.debug("Error! Unknown measurement type", v)
      }
    }
    
    // parsing done
    // now resolve the formulae
    functions.forEach((node, key) => {
      if (node instanceof NodeRef) {
        resolve(node, key, functions)
      }
    })

    console.debug("Debug message: calculated values", functions)
    // put back to the values store
    functions.forEach((node, key) => {
      if (node instanceof MeasureDataUnit) {
        values.set(key, node.value)
      } else if (node instanceof MeasureDataList) {
        values.set(key, node.values.join(","))
      }
    })

    return functions
  }

  static examineModel(values: Map<string, MTreeNode>):[Set<SubprocessComponent>, Map<SubprocessComponent, SubprocessComponent>] {
    let sm = functionCollection.getStateMan()
    let model = sm.state.modelWrapper.model
    let visited = new Map<SubprocessComponent, Boolean>()
    let pathchoice = new Map<SubprocessComponent, SubprocessComponent>()
    let dead = new Set<SubprocessComponent>()
    if (model.root != null && model.root.start != null) {
      if (verifyNode(model.root.start, values, visited, dead, pathchoice)) {
        alert("Measurement test passed")
      } else {
        alert("Measurement test failed")
      }      
    }
    return [dead, pathchoice]
  }
}

function markNode(x:SubprocessComponent, page: Subprocess, dead: Set<SubprocessComponent>, result: Map<string, MeasureRType>, choice:Map<SubprocessComponent, SubprocessComponent>):boolean {
  let ret = true
  if (x.element != null) {
    let id = page.id + " " + x.element.id
    if (!result.has(id)) {
      if (dead.has(x)) {
        result.set(id, MeasureRType.ERRORSOURCE)        
        return false
      }
      if (x.element instanceof Process) {
        let p = x.element        
        if (p.page != null && p.page.start != null) {          
          if (!markNode(p.page.start, p.page, dead, result, choice)) {
            result.set(id, MeasureRType.CONTAINERROR)            
            return false
          }
        }
      }
      result.set(id, MeasureRType.OK)      
      if (x.element instanceof EGate) {
        let go = choice.get(x)
        if (go == undefined) {
          ret = false
          for (let c of x.child) {
            if (c.to != null) {
              let x = markNode(c.to, page, dead, result, choice)
              ret = x || ret
            }
          }
        } else {
          // go to exactly one path
          ret = markNode(go, page, dead, result, choice)
        }
      } else {
        for (let c of x.child) {
          if (c.to != null) {
            let x = markNode(c.to, page, dead, result, choice)
            ret = ret && x
          }
        } 
      }
    } else {
      let r = result.get(id)
      if (r == MeasureRType.OK) {
        return true
      } else {
        return false
      }
    }
  }  
  return ret
}

function verifyNode(x:SubprocessComponent, values: Map<string, MTreeNode>, visited: Map<SubprocessComponent, Boolean>, dead: Set<SubprocessComponent>, choice: Map<SubprocessComponent, SubprocessComponent>):Boolean {
  let y = visited.get(x)  
  if (y != undefined) {
    return y
  }
  let result:Boolean = true
  visited.set(x, result)
  if (x.element instanceof Process) {
    let p = x.element
    p.measure.map((m) => {
      if (!validateCondition(m, values)) {
        dead.add(x)
        result = false
      }
    })
    if (p.page != null && p.page.start != null) {
      result = verifyNode(p.page.start, values, visited, dead, choice)
    }
  }
  if (x.element instanceof EGate) {
    let alldefined = x.child.length > 0
    for (let c of x.child) {
      if (c.condition == "") {
        alldefined = false
      }
    }    
    if (!alldefined) {
      result = x.child.length == 0
      for (let c of x.child) {
        if (c.to != null) {
          if (verifyNode(c.to, values, visited, dead, choice)) {
            result = true
          }
        }
      }    
    } else {
      // go to exactly one path
      let go = findNext(x, values)
      choice.set(x, go)
      result = verifyNode(go, values, visited, dead, choice)      
    }
  } else {
    for (let c of x.child) {
      if (c.to != null) {
        if (!verifyNode(c.to, values, visited, dead, choice)) {
          result = false        
        }
      }
    }
  }
  visited.set(x, result)  
  return result
}

function validateCondition(cond:string, values: Map<string, MTreeNode>):Boolean {
  let para1 = ""
  let para2 = ""
  let op = ""
  if (cond.indexOf(">=") != -1) {
    let x = cond.indexOf(">=")
    console.debug(x)
    para1 = cond.substr(0, x).trim()
    op = cond.substr(x, 2)
    para2 = cond.substr(x+2).trim()
  } else if (cond.indexOf("<=") != -1) {
    let x = cond.indexOf("<=")
    console.debug(x)
    para1 = cond.substr(0, x).trim()
    op = cond.substr(x, 2)
    para2 = cond.substr(x+2).trim()
  } else if (cond.indexOf("=") != -1) {
    let x = cond.indexOf("=")
    console.debug(x)
    para1 = cond.substr(0, x).trim()
    op = cond.substr(x, 1)
    para2 = cond.substr(x+1).trim()
  } else if (cond.indexOf(">") != -1) {
    let x = cond.indexOf(">")    
    para1 = cond.substr(0, x).trim()
    op = cond.substr(x, 1)
    para2 = cond.substr(x+1).trim()
  } else if (cond.indexOf("<") != -1) {
    let x = cond.indexOf("<")    
    para1 = cond.substr(0, x).trim()
    op = cond.substr(x, 1)
    para2 = cond.substr(x+1).trim()
  }  
  let pattern = /\[.*?\]/
  let x, y
  if (pattern.test(para1)) {
    x = values.get(para1.substr(1, para1.length-2))
  } else {
    x = new MeasureDataUnit("", para1)
  }
  if (pattern.test(para2)) {
    y = values.get(para2.substr(1, para2.length-2))
    
  } else {
    y = new MeasureDataUnit("", para2)
  }  
  if (x instanceof MTreeNode && y instanceof MTreeNode) {
    let operator = ComparisonsOperators.get(op)
    if (operator == undefined) {
      console.error("Operator cannot be resolved", op)
    } else {      
      return operator.op(x, y)
    }
  } else {
    console.error("Parameters format not correct", x, y)
  }
  return true
}

function findNext(x:SubprocessComponent, values:Map<string, MTreeNode>):SubprocessComponent {
  let go:Edge = x.child[0]
  for (let c of x.child) {
    if (c.condition == "default") {
      go = c
    }
  }
  for (let c of x.child) {
    if (c.condition != "default") {
      if (validateCondition(c.condition, values)) {
        go = c
      }
    }
  }
  if (go.to != null) {
    return go.to
  }
  return x
}

function resolve(n:NodeRef, key:string, functions:Map<string, MTreeNode>) {
  let ret = resolveNode(n, functions)
  functions.set(key, ret)
}

function resolveNode(n:NodeRef, functions:Map<string, MTreeNode>):MTreeNode {
  if (n.type == NodeType.DATA) {
    let x = functions.get(n.id)
    if (x == undefined) {
      console.error("Measurement cannot be resolved", n.id)
    } else {
      if (x instanceof NodeRef) {
        resolve(x, n.id, functions)
        let y = functions.get(n.id)
        if (y != undefined) {
          return y
        }
      } else {
        return x
      }
    }  
  } else if (n.type == NodeType.LISTOP) {
    let op = MeasurementOperators.get(n.id)
    if (op == undefined) {
      console.error("Operator cannot be resolved", n.id)
    } else if (op instanceof ListOperator) {
      if (n.childs.length != 1) {
        console.error("Number of parameter is not 1", n.id, op)
      } else {      
        let c = n.childs[0]
        if (c instanceof NodeRef) {
          c = resolveNode(c, functions)
        }
        if (c instanceof MeasureDataList) {   
          let result = op.op(c)          
          return result
        } else {
          console.error("Expecting a list as a parameter", n.id, op, c)
        }
      }
    } else {
      console.error("Operator is not a list operator", n.id, op)
    }
  } else if (n.type == NodeType.BINOP) {
    let op = MeasurementOperators.get(n.id)
    if (op == undefined) {
      console.error("Operator cannot be resolved", n.id)
    } else if (op instanceof BinaryOperator) {
      if (n.childs.length != 2) {
        console.error("Number of parameter is not 2", n.id, op)
      } else {      
        let c1 = n.childs[0]
        let c2 = n.childs[1]
        if (c1 instanceof NodeRef) {
          c1 = resolveNode(c1, functions)
        }
        if (c2 instanceof NodeRef) {
          c2 = resolveNode(c2, functions)
        }
        return op.op(c1, c2)
      }
    } else {
      console.error("Operator is not a binary operator", n.id, op)
    }
  }
  console.error("Error. Case not handled", n)
  return new MTreeNode("dummy")
}

function parseMeasurement(f: Map<string, MTreeNode>, x:string):MTreeNode {
  let tokens = tokenize(x)
  let stack:Array<MTreeNode> = []
  // first merge only the list operators
  for (let i = 0;i < tokens.length;i++) {
    let t = tokens[i]
    if (t.type == NodeType.DATA) {
      stack.push(new NodeRef(t.ref, t.type))
    } else if (t.type == NodeType.LISTOP) {
      let z = stack.pop()
      if (z == undefined) {
        console.error("No data for list operator", t, x, tokens)
      } else {
        let nn = new NodeRef(t.ref, t.type)
        nn.childs.push(z)
        stack.push(nn)
      }
    } else if (t.type == NodeType.BINOP) {
      stack.push(new NodeRef(t.ref, t.type))      
    }
  }
  let stack2:Array<MTreeNode> = []
  // second, process and merge binary operators
  for (let i = 0;i < stack.length;i++) {
    let node = stack[i]
    if (node instanceof NodeRef && node.type == NodeType.BINOP) {
      let z = stack2.pop()
      i++;
      if (z == undefined) {
        console.error("No first data for binar operator", node, x, tokens, stack)
      } else if (i < stack.length) {
        let second = stack[i]        
        node.childs.push(z)
        node.childs.push(second)
        stack2.push(node)
      } else {                
        console.error("No second data for binary operator", node, x, tokens, stack)
      }
    } else {
      stack2.push(node)
    }    
  }
  if (stack2.length != 1) {
    console.error("The parse result is not a single operation tree!", x, tokens, stack)
  }
  return stack2[0]
}

function tokenize(x:string):Array<Token> {
  let out:Array<Token> = []
  for (let i = 0; i < x.length;i++) { 
    let c = x[i]
    if (/\s/.test(c)) {
      // space, do nothing
    } else if (c == '[') {
      // a measurement reference
      i++
      let name = ""
      while (i < x.length && x[i] != ']') {
        name += x[i]
        i++
      }
      out.push({ref:name, type:NodeType.DATA})
    } else if (c == '.') {
      // a list operator
      i++;
      let name = ""
      while (i < x.length && !(/\s/.test(x[i]))) {
        name += x[i]
        i++
      }
      out.push({ref:name, type:NodeType.LISTOP})      
    } else if (/[\+\-\*/]/.test(c)) {
      // a binary operator
      out.push({ref:c, type:NodeType.BINOP})
    } else {
      console.debug("Unknown tokens", c)
    }
  }
  return out
}

interface Token {
  ref:string
  type: NodeType
}
