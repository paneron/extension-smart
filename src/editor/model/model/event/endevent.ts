import { EventNode } from './event'
import * as tokenizer from '../../util/tokenizer'

export class EndEvent extends EventNode {  
  
  constructor(id:string, data:string) {
    super(id)
    if (data != "") {
      let t:Array<string> = tokenizer.tokenizePackage(data)
      if (t.length > 0) {
        console.error('Parsing error: end_event. ID ' + id + ': Expecting empty body')
      }
    }
  }

  toModel():string {		
		return "end_event " + this.id + " {\n}\n"
	}
}