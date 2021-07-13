/** @jsx jsx */
/** @jsxFrag React.Fragment */

import React from 'react'
import { XYPosition } from 'react-flow-renderer'
import { Dataclass } from '../model/model/data/dataclass'
import { Registry } from '../model/model/data/registry'
import { EndEvent } from '../model/model/event/endevent'
import { SignalCatchEvent } from '../model/model/event/signalcatchevent'
import { StartEvent } from '../model/model/event/startevent'
import { TimerEvent } from '../model/model/event/timerevent'
import { EGate } from '../model/model/gate/egate'
import { GraphNode } from '../model/model/graphnode'
import { Approval } from '../model/model/process/approval'
import { Process } from '../model/model/process/process'
import { ModelType } from './mapper/model/mapperstate'

export class NodeContainer {
  id:string
  type:string
  data:NodeData
  position:XYPosition  
  isHidden = false  

  constructor(x: GraphNode, pos: {x:number, y:number}) {
    this.id = x.id
    this.position = pos
    this.type = checkType(x)    
    this.data = new NodeData(x)    
  }
}

function checkType(x:GraphNode):string {
  if (x instanceof StartEvent) {    
    return "start"    
  } else if (x instanceof EndEvent) {    
    return "end"
  } else if (x instanceof TimerEvent) {    
    return "timer"
  } else if (x instanceof EGate) {    
    return "egate"
  } else if (x instanceof SignalCatchEvent) {    
    return "signalcatch"
  } else if (x instanceof Process) {        
    return "process"
  } else if (x instanceof Approval) {        
    return "approval"
  } else if (x instanceof Registry || x instanceof Dataclass) {    
    return "data"
  }   
  return "default"    
}

export class NodeData {
  label:JSX.Element
  represent:string  
  modelType:ModelType|null

  constructor(x:GraphNode) {    
    this.represent = x.id
    this.modelType = null
    if (x instanceof Process) {
      this.label = <> {x.name==""?x.id:x.name} </>
    } else if (x instanceof Approval) {
      this.label = <> {x.name==""?x.id:x.name} </>
    } else if (x instanceof Registry) {
      this.label = <> {x.title==""?x.id:x.title} </>
    } else {
      this.label = <> {extractID(x.id)} </>
    }
  }

}

function extractID(x:string) {
  let index = x.lastIndexOf("#")
  if (index != -1) {
    return x.substr(index+1)
  }
  return x
}
