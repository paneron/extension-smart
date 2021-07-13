import { Dataclass } from "../../model/model/data/dataclass";
import { Subprocess, SubprocessComponent } from "../../model/model/flow/subprocess";
import { Approval } from "../../model/model/process/approval";
import { Process } from "../../model/model/process/process";
import { Provision } from "../../model/model/support/provision";
import { ISearch } from "../interface/state";
import { ModelWrapper } from "../model/modelwrapper";

export function calculateFilter(mw:ModelWrapper, cond:ISearch):void {
  let model = mw.model
  let require:boolean = cond.document!="" || cond.actor !=""
  for (let p of model.hps) {
    p.filterMatch = require?FilterType.UNKNOWN:FilterType.NOT_MATCH    
  }
  for (let p of model.aps) {
    p.filterMatch = require?FilterType.UNKNOWN:FilterType.NOT_MATCH    
  }
  for (let d of model.dcs) {
    d.filterMatch = cond.document!=""?checkData(d, cond):FilterType.NOT_MATCH    
  }
  if (mw.model.root != null && require) {
    explore(mw.model.root, new Set<SubprocessComponent>(), cond)
  }  
}

function checkData(d:Dataclass, cond:ISearch):FilterType {
  for (let a of d.attributes) {
    for (let r of a.ref) {
      if (cond.document == r.document && (cond.clause == "" || cond.clause == r.clause)) {
        return FilterType.EXACT_MATCH
      }
    }
  }  
  return FilterType.NOT_MATCH
}

function explore(x:Subprocess, visited:Set<SubprocessComponent>, cond:ISearch):boolean {
  let result = false
  x.childs.forEach((c) => {
    if (!visited.has(c)) {
      visited.add(c)
      if (c.element instanceof Process) {
        if (checkProcess(c.element, cond, visited)) result = true                
      } else if (c.element instanceof Approval) {
        if (checkApproval(c.element, cond)) result = true
      }
    } else if (c.element instanceof Process) {
      if (c.element.filterMatch == FilterType.UNKNOWN) {
        console.error("Filter match result is not computed before access?", x)
      }
      if (c.element.filterMatch == FilterType.EXACT_MATCH || c.element.filterMatch == FilterType.SUBPROCESS_MATCH) {
        result = true
      }
    }
  })
  return result  
}

function checkProcess(p:Process, cond:ISearch, visited:Set<SubprocessComponent>):boolean {      
  let result = false
  if (p.page != null) {  
    if (explore(p.page, visited, cond)) {      
      p.filterMatch = FilterType.SUBPROCESS_MATCH
      result = true
    }
  }  
  if (cond.actor == "" || (p.actor != null && p.actor.name == cond.actor)) {
    if (cond.document != "") {
      p.provision.map((x) => {
        if (checkProvision(x, cond)) {
          p.filterMatch = FilterType.EXACT_MATCH
          result = true
        }       
      })
    } else {
      p.filterMatch = FilterType.EXACT_MATCH      
      result = true
    }
  }  
  if (!result) {
    p.filterMatch = FilterType.NOT_MATCH  
  }
  return result
}

function checkProvision(p:Provision, cond:ISearch):boolean {  
  for (let r of p.ref) {
    if (cond.document == r.document && (cond.clause == "" || cond.clause == r.clause)) {
      return true
    }
  }
  return false
}

function checkApproval(p:Approval, cond:ISearch):boolean {
  if (cond.actor == "" || (p.actor != null && p.actor.name == cond.actor) || (p.approver != null && p.approver.name == cond.actor)) {
    for (let r of p.ref) {
      if (cond.document == r.document && (cond.clause == "" || cond.clause == r.clause)) {
        p.filterMatch = FilterType.EXACT_MATCH
        return true
      }
    }
  }
  return false
}
  
export enum FilterType {
  UNKNOWN,
  NOT_MATCH,
  EXACT_MATCH,
  SUBPROCESS_MATCH
}