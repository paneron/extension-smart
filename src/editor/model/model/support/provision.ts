import { IDRegistry } from '../../util/IDRegistry'
import * as tokenizer from '../../util/tokenizer'
import { GraphNode } from '../graphnode'
import { Process } from '../process/process'
import { Reference } from './reference'

export class Provision {
  subject = new Map<string, string>()
  id:string = ""
  modality:string = "" 
  condition:string = ""
  ref:Array<Reference> = []
  reftext:Array<string> = []
  
  isChecked:boolean = false
  mother:Array<Process> = []

  progress:number = 0

  parent:Array<GraphNode> = []

  constructor(id:string, data:string) {
    this.id = id 
    if (data != "") {
      let t:Array<string> = tokenizer.tokenizePackage(data)
      let i:number  = 0
      while (i < t.length) {
        let command:string = t[i++]
        if (i < t.length) {
          if (command == "modality") {
            this.modality = t[i++]
          } else if (command == "condition") {
            this.condition = tokenizer.removePackage(t[i++])
          } else if (command == "reference") {
            this.reftext = tokenizer.tokenizePackage(t[i++])
          } else {
            this.subject.set(command, t[i++])
          }
        } else {
          console.error('Parsing error: provision. ID ' + id + ': Expecting value for ' + command)
        }
      }
    }
  }

  resolve(idreg:IDRegistry):void {
    for (let x of this.reftext) {
      let y = idreg.getReference(x)
      if (y != null) {
        this.ref.push(y)        
      }
    }        
  }

  toModel():string {		
		let out:string = "provision " + this.id + " {\n"
    this.subject.forEach((value:string, key:string) => {
      out += "  " + key + " " + value + "\n";
    })    
		out += "  condition \"" + this.condition + "\"\n"
    if (this.modality != "") {
		  out += "  modality " + this.modality + "\n"
    }
		if (this.ref.length > 0) {
			out += "  reference {\n"
			for (let r of this.ref) {
				out += "    " + r.id + "\n"
			}
			out += "  }\n"
		}
		out += "}\n"
		return out
	}

}