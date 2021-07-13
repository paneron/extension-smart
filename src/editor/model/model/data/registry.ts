import { Dataclass } from './dataclass'
import * as tokenizer from '../../util/tokenizer'
import { GraphNode } from '../graphnode'
import { IDRegistry } from '../../util/IDRegistry'

export class Registry extends GraphNode {  
  title:string = ""
  data:Dataclass | null = null

  dctext:string = ""  

  constructor(id:string, data:string) {
    super(id)
    if (data != "") {
      let t:Array<string> = tokenizer.tokenizePackage(data)
      let i:number  = 0
      while (i < t.length) {
        let command:string = t[i++]
        if (i < t.length) {
          if (command == "title") {
            this.title = tokenizer.removePackage(t[i++])
          } else if (command == "data_class") {
            this.dctext = t[i++]
          } else {
            console.error('Parsing error: registry. ID ' + id + ': Unknown keyword ' + command)
          }
        } else {
          console.error('Parsing error: registry. ID ' + id + ': Expecting value for ' + command)
        }
      }
    }
  }

  resolve(idreg:IDRegistry):void {
    let y = idreg.getObject(this.dctext)
    if (y instanceof Dataclass) {
      this.data = <Dataclass> y
      y.mother = this
    } else {
      console.error("Error in resolving IDs in data class for registry " + this.id)
    }
  }

  toModel():string {		
		let out:string = "data_registry " + this.id + " {\n"
		out += "  title \""+ this.title+"\"\n"
    if (this.data != null) {
		  out += "  data_class "+ this.data.id +"\n"
    }
		out += "}\n"
		return out
	}
  
}