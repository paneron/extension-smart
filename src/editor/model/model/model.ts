import { Provision } from "./support/provision"
import { Role } from "./support/role"
import { Metadata } from "./support/metadata"
import { Process } from "./process/process"
import { Dataclass } from "./data/dataclass"
import { Registry } from "./data/registry"
import { EventNode } from "./event/event"
import { Gateway } from "./gate/gate"
import { Reference } from "./support/reference"
import { Approval } from "./process/approval"
import { Enum } from "./data/enum"
import { IDRegistry } from "../util/IDRegistry"
import { Subprocess } from "./flow/subprocess"
import { Variable } from "./measure/variable"
import { MappingManager } from "../../ui/mapper/util/mappingmanager"

export class Model {  
  meta: Metadata = new Metadata("")
  roles: Array<Role> = []
  provisions: Array<Provision> = []
  pages:Array<Subprocess> = []
  hps:Array<Process> = []
  dcs:Array<Dataclass> = []
  regs:Array<Registry> = []
  evs:Array<EventNode> = []
  gates:Array<Gateway> = []  
  refs:Array<Reference> = []
  aps:Array<Approval> = []
  enums:Array<Enum> = []
  vars:Array<Variable> = []
  maps:MappingManager = new MappingManager()

  root: Subprocess | null = null

  roottext: string = ""

  idreg: IDRegistry = new IDRegistry()

  resolve(): void {
    if (this.roottext != "") {
      let r = this.idreg.pageids.get(this.roottext)
      if (r instanceof Subprocess) {
        this.root = r
      }
    }
    if (this.root == null) {
      this.root = new Subprocess("root", "")
    }
    for (let p of this.pages) {
      p.resolve(this.idreg)
    }
    for (let p of this.provisions) {
      p.resolve(this.idreg)
    }
    for (let p of this.aps) {
      p.resolve(this.idreg)
    }
    for (let d of this.regs) {
      d.resolve(this.idreg)
    }
    for (let d of this.dcs) {
      d.resolve(this.idreg)
    }
    for (let p of this.hps) {
      p.resolve(this.idreg)
    }
  }

  toModel():string {
    let out: string = ""
    if (this.root != null)
       out += "root " + this.root.id+"\n\n"
    out += this.meta.toModel()+'\n'    
    for (let r of this.roles) {
			out += r.toModel() + "\n"
		}
		for (let p of this.hps) {
			out += p.toModel() + "\n"
		}
    for (let r of this.provisions) {		
			out += r.toModel() + "\n"
		}
    for (let a of this.aps) {		
			out += a.toModel() + "\n"
		}
		for (let e of this.evs) {
			out += e.toModel() + "\n"
		}
		for (let g of this.gates) {
			out += g.toModel() + "\n"
		}  
    for (let e of this.enums) {
      out += e.toModel() + "\n"
    }
    for (let c of this.dcs) {      
      out += c.toModel() + "\n"      
		}
		for (let d of this.regs) {
			out += d.toModel() + "\n"
    }
    for (let p of this.pages) {
      out += p.toModel() + "\n"
    }
    for (let v of this.vars) {
      out += v.toModel() + "\n"
    }
		for (let r of this.refs) {
			out += r.toModel() + "\n"
		}
    out += this.maps.toModel()    
    return out
  }  

  reset():void {
    for (let x of this.evs) {
      x.isAdded = false
    }
    for (let x of this.dcs) {
      x.isAdded = false
    }
    for (let x of this.hps) {
      x.isAdded = false
    }
    for (let x of this.aps) {
      x.isAdded = false
    }
    for (let x of this.gates) {
      x.isAdded = false
    }
    for (let x of this.regs) {
      x.isAdded = false
    }    
  }
}
