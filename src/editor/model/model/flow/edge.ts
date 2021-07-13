import * as tokenizer from '../../util/tokenizer'
import { SubprocessComponent } from './subprocess'

export class Edge {  
  id: string = ""
  from: SubprocessComponent | null = null
  to: SubprocessComponent | null = null

  fromtext:string = ""
  totext:string = ""
  description:string = ""
  condition:string = ""

  isDone:boolean = false

  constructor(id:string, data:string) {
    this.id = id
    let t:Array<string> = tokenizer.tokenizePackage(data)
    let i:number  = 0
    while (i < t.length) {
      let command:string = t[i++]
      if (i < t.length) {
        if (command == "from") {
          this.fromtext = t[i++]
        } else if (command == "description") {
          this.description = tokenizer.removePackage(t[i++])
        } else if (command == "condition") {
          this.condition = tokenizer.removePackage(t[i++])
        } else if (command == "to") {
          this.totext = t[i++]
        } else {
          console.error('Parsing error: process flow. ID ' + id + ': Unknown keyword ' + command)
        }
      } else {
        console.error('Parsing error: process flow. ID ' + id + ': Expecting value for ' + command)
      }
    }
  }

  resolve(idreg: Map<string, SubprocessComponent>): void {
    let x = idreg.get(this.fromtext)
    if (x != undefined) {
      this.from = x
    } else {
      console.error("Error in resolving IDs in from for egde " + this.id)
    }
    x = idreg.get(this.totext)
    if (x != undefined) {
      this.to = x
    } else {
      console.error("Error in resolving IDs in to for egde " + this.id)
    }
    if (this.from != null) {
      this.from.child.push(this)
    }
  }

  toModel():string {
    let out: string = "    " + this.id + " {\n"
    if (this.from != null && this.from.element != null) {
		  out += "      from " + this.from.element.id + "\n"
    }
    if (this.to != null && this.to.element != null) {
		  out += "      to " + this.to.element.id + "\n"
    }
		if (this.description != "") {
			out += "      description \"" + this.description + "\"\n"
		}
    if (this.condition != "") {
			out += "      condition \"" + this.condition + "\"\n"
		}
		out += "    }\n"
		return out
	}
}
