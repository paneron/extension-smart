// centralize all the functions for cleaning up the model when removing something (e.g., process)

import { EventNode } from "../../model/model/event/event";
import { Approval } from "../../model/model/process/approval";
import { Process } from "../../model/model/process/process";
import { functionCollection } from "./function";
import { Gateway } from "../../model/model/gate/gate";
import { Registry } from "../../model/model/data/registry";
import { Dataclass } from "../../model/model/data/dataclass";
import { GraphNode } from "../../model/model/graphnode";
import { Subprocess, SubprocessComponent } from "../../model/model/flow/subprocess";

export class Cleaner {
  
  static removeProcess(process:Process) {
    let sm = functionCollection.getStateMan()
    let state = sm.state
    let model = state.modelWrapper.model

    let found = Cleaner.removeGraphNode(process)
    let idreg = model.idreg
    if (!found) {
      let index = model.hps.indexOf(process)
      model.hps.splice(index, 1)
      idreg.ids.delete(process.id)
      Cleaner.cleanProvisions(process)
    }
    if (process.page != null) {
      Cleaner.killPage(process.page)
    }
    sm.setState({...state})
  }

  static killPage(page:Subprocess) {    
    let sm = functionCollection.getStateMan()
    let state = sm.state    
    let model = state.modelWrapper.model
    let idreg = model.idreg
    
    const childHandle = (c:SubprocessComponent) => {
      if (c.element != null) {
        let x = c.element
        x.pages.delete(page)
        if (!(x instanceof Dataclass || x instanceof Registry)) {
          if (x.pages.size == 0) {
            idreg.ids.delete(x.id)            
            if (x instanceof Process) {
              let index = model.hps.indexOf(x)
              model.hps.splice(index, 1)
              Cleaner.cleanProvisions(x)
              if (x.page != null) {
                Cleaner.killPage(x.page)
              }
            } else if (x instanceof Approval) {
              let index = model.aps.indexOf(x)
              model.aps.splice(index, 1)
            } else if (x instanceof EventNode) {
              let index = model.evs.indexOf(x)
              model.evs.splice(index, 1)
            } else if (x instanceof Gateway) {
              let index = model.gates.indexOf(x)
              model.gates.splice(index, 1)
            }       
          }
        }
      }
    }

    page.childs.forEach(childHandle)
    page.data.forEach(childHandle)

    let index = model.pages.indexOf(page)
    model.pages.splice(index, 1)    
  }

  static cleanProvisions(process:Process) {
    let sm = functionCollection.getStateMan()
    let state = sm.state    
    let model = state.modelWrapper.model
    let idreg = model.idreg
    process.provision.map((p) => {      
      idreg.reqs.delete(p.id)
      let index = model.provisions.indexOf(p)
      model.provisions.splice(index, 1)
    })
    process.provision = []
  }
  
  // return true if the removed node is not the last appearance
  static removeGraphNode(x:GraphNode):boolean {
    let sm = functionCollection.getStateMan()
    let state = sm.state    
    let idreg = state.modelWrapper.model.idreg
    let page = sm.state.modelWrapper.page
    
    page.childs.forEach((c, index) => {
      if (c.element == x) {
        page.childs.splice(index, 1)
        x.pages.delete(page)
        page.map.delete(x.id)
      }
    })

    page.data.forEach((c, index) => {
      if (c.element == x) {
        page.data.splice(index, 1)
        x.pages.delete(page)
        page.map.delete(x.id)
      }
    })

    for (let i = page.edges.length - 1;i >= 0;i--) {
      let e = page.edges[i]
      if (e.from?.element == x || e.to?.element == x) {
        page.edges.splice(i, 1)
        idreg.edgeids.delete(e.id)
        if (e.to?.element == x) {
          let index = e.from?.child.indexOf(e)
          if (index != undefined) {
            e.from?.child.splice(index, 1)
          }
        }
      }      
    }    

    return x.pages.size > 0            
  }
  
  static removeApproval(a:Approval) {
    let sm = functionCollection.getStateMan()
    let state = sm.state
    let model = state.modelWrapper.model

    let found = Cleaner.removeGraphNode(a)
    let idreg = model.idreg
    if (!found) {
      let index = model.aps.indexOf(a)
      model.aps.splice(index, 1)
      idreg.ids.delete(a.id)      
    }        
    sm.setState({...state})
  }

  static removeGate(e:Gateway) {
    let sm = functionCollection.getStateMan()
    let state = sm.state    
    let model = state.modelWrapper.model    

    let found = Cleaner.removeGraphNode(e)
    let idreg = model.idreg
    if (!found) {
      let index = model.gates.indexOf(e)
      model.gates.splice(index, 1)
      idreg.ids.delete(e.id)      
    }    
    sm.setState({...state})
  }

  static removeEvent(e:EventNode) {
    let sm = functionCollection.getStateMan()
    let state = sm.state    
    let model = state.modelWrapper.model    

    let found = Cleaner.removeGraphNode(e)
    let idreg = model.idreg
    if (!found) {
      let index = model.evs.indexOf(e)
      model.evs.splice(index, 1)
      idreg.ids.delete(e.id)      
    }    
    sm.setState({...state})
  }

  static removeEdge(source:string, target:string) {    
    let sm = functionCollection.getStateMan()
    let state = sm.state
    let model = state.modelWrapper.model
    let page = state.modelWrapper.page
    let idreg = model.idreg

    let s = page.map.get(source)
    let t = page.map.get(target)    
    if (s != null && t != null && s instanceof SubprocessComponent && t instanceof SubprocessComponent) {
      page.edges.forEach((e, index) => {
        if (e.from == s && e.to == t) {
          page.edges.splice(index, 1)
          idreg.edgeids.delete(e.id)
          sm.setState({...state})
          return
        }      
      })
    }
  }
}