import { Dataclass } from "../model/data/dataclass"
import { Edge } from "../model/flow/edge"
import { Subprocess } from "../model/flow/subprocess"
import { Variable } from "../model/measure/variable"
import { Provision } from "../model/support/provision"
import { Reference } from "../model/support/reference"

export const TimerType:Array<string> = ["", "WAIT", "REPEAT"]
export const MODAILITYOPTIONS:Array<string> = ["", "SHALL", "SHOULD", "CAN", "MAY"]
export const EMPTYTYPE = ""
export const STRINGTYPE = "string"
export const BOOLEANTYPE = "boolean"
export const DATETIMETYPE = "datetime"
export const ROLETYPE = "role"
export const DATATYPE: Array<string> = [EMPTYTYPE, STRINGTYPE, BOOLEANTYPE, DATETIMETYPE, ROLETYPE]

export const BOOLEANOPTIONS = ["", "True", "False"]

export class IDRegistry {  
  ids = new Map<string, Object>()
  reqs = new Map<string, Provision>()
  refs = new Map<string, Reference>()
  edgeids = new Map<string, Object>()
  pageids = new Map<string, Subprocess>()
  varids = new Map<string, Variable>()

  tryids = new Map<string, number>()

  addID(id:string, v:Object):void {    
    if (this.ids.has(id)) {
      console.error("Duplicated ID " + id + " with object " + v)
    } else {
      this.ids.set(id, v)
    }
  }

  addProvision(id:string, v:Provision):void {
    if (this.reqs.has(id)) {
      console.error("Duplicated ID " + id + " with object " + v)
    } else {
      this.reqs.set(id, v)
    }
  }

  addReference(id:string, v:Reference):void {
    if (this.refs.has(id)) {
      console.error("Duplicated ID " + id + " with object " + v)
    } else {
      this.refs.set(id, v)
    }
  }

  addPage(id: string, p: Subprocess): void {
    if (this.pageids.has(id)) {
      console.error("Duplicated ID " + id + " with subprocess " + id)
    } else {
      this.pageids.set(id, p)
    }
  }

  addEdge(id:string, e:Edge):void {
    if (this.edgeids.has(id)) {
      console.error("Duplicated ID " + id + " with object " + e)
    } else {
      this.edgeids.set(id, e)
    }
  }

  addVariable(id:string, v:Variable) {
    if (this.varids.has(id)) {
      console.error("Duplicated ID " + id + " with object " + v)
    } else {
      this.varids.set(id, v)
    }
  }

  getObject(id:string):Object|null {
    let x = this.ids.get(id)
    if (x == undefined) {
      console.error("No object is found with ID " + id)
      return null
    }  
    return x
  }

  getReference(id:string):Reference|null {
    let x = this.refs.get(id)
    if (x == undefined) {
      console.error("No Reference is found with ID " + id)
      return null
    }  
    return x
  }

  getProvision(id:string):Provision|null {
    let x = this.reqs.get(id)
    if (x == undefined) {
      console.error("No provision is found with ID " + id)
      return null
    }
    return x
  }

  getDataclass(id:string):Dataclass|null {
    let x = this.ids.get(id)
    if (x == undefined) {      
      return null
    }
    if (x instanceof Dataclass) {
      return x
    }
    return null
  }

  findUniqueID(prefix:string):string {
    let num = this.getLastNumber(prefix)
    while (this.ids.has(prefix+num)) num++
    this.tryids.set(prefix, num+1)
    return prefix+num
  }

  findUniqueProvisionID(prefix:string):string {
    let num = this.getLastNumber(prefix)
    while (this.reqs.has(prefix+num)) num++
    this.tryids.set(prefix, num+1)
    return prefix+num
  }

  findUniqueEdgeID(prefix:string):string {
    let num = this.getLastNumber(prefix)
    while (this.edgeids.has(prefix+num)) num++
    this.tryids.set(prefix, num+1)
    return prefix+num
  }

  findUniquePageID(prefix: string): string {
    let num = this.getLastNumber(prefix)
    while (this.pageids.has(prefix + num)) num++
    this.tryids.set(prefix, num + 1)
    return prefix + num
  }

  findUniqueRefID(prefix: string): string {
    let num = this.getLastNumber(prefix)
    while (this.refs.has(prefix + num)) num++
    this.tryids.set(prefix, num + 1)
    return prefix + num
  }

  private getLastNumber(prefix:string) {    
    let x = this.tryids.get(prefix)
    if (x == undefined) {
      this.tryids.set(prefix, 0)
    }
    return 0
  }
}