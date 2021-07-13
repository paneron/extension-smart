import { CSSProperties } from 'react'
import { ArrowHeadType } from 'react-flow-renderer'
import { Dataclass } from '../model/model/data/dataclass'
import { Registry } from '../model/model/data/registry'
import { GraphNode } from '../model/model/graphnode'

export class DataLinkContainer {
  id:string
  source:string = ""
  target:string = ""
  type:string = "default"
  arrowHeadType:ArrowHeadType = ArrowHeadType.ArrowClosed
  animated = true
  label:string = ""
  style:CSSProperties = {}
  isHidden = false

  constructor(s:GraphNode, t:GraphNode) {    
    this.id = s.id+"#datato#"+t.id
    this.source = s.id
    this.target = t.id
    if (isData(s)&&isData(t)) {
      this.style.stroke = "#f6ab6c"
    }
  }
}

function isData(x:GraphNode):boolean {
  return x instanceof Registry || x instanceof Dataclass
}