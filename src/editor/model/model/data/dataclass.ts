import { DataAttribute } from './dataattribute'
import * as tokenizer from '../../util/tokenizer'
import { IDRegistry } from '../../util/IDRegistry'
import { GraphNode } from '../graphnode'
import { Registry } from './registry'
import { Process } from '../process/process'
import { FilterType } from '../../../ui/util/filtermanager'

export class Dataclass extends GraphNode {

  attributes:Array<DataAttribute> = []

  rdcs:Set<Dataclass> = new Set<Dataclass>()
  motherref:Set<Dataclass> = new Set<Dataclass>()
  motherprocess:Set<Process> = new Set<Process>()
  mother:Registry|null = null

  isChecked:boolean = false
  filterMatch:number = FilterType.NOT_MATCH  

  constructor(id:string, data:string) {
    super(id)        
    if (data != "") {
      let t:Array<string> = tokenizer.tokenizeAttributes(data)    
      let i:number  = 0
      while (i < t.length) {
        let basic:string = t[i++]
        if (i < t.length) {
          let details:string = t[i++]
          this.attributes.push(new DataAttribute(basic.trim(), details))
        } else {
          console.error('Parsing error: class. ID ' + id + ': Expecting { after ' + basic)
        }
      }
    }
  }

  resolve(idreg:IDRegistry):void {
    for (let x of this.attributes) {
      let d = x.resolve(idreg)
      x.mother.push(this)
      if (d != null) {
        if (!this.rdcs.has(d)) {
          this.rdcs.add(d)
          d.motherref.add(this)
        }
      }
    }
  }

  toModel():string {	
    let out:string = "class " + this.id + " {\n";
		for (let a of this.attributes) {
			out += a.toModel()
		}
		out += "}\n"
		return out
	}    

}