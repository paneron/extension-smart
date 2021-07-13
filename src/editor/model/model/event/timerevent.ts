import { EventNode } from './event'
import * as tokenizer from '../../util/tokenizer'

export class TimerEvent extends EventNode {
  type:string = ""
  para:string = ""

  constructor(id:string, data:string) {
    super(id)
    if (data != "") {
      let t:Array<string> = tokenizer.tokenizePackage(data)
      let i:number  = 0
      while (i < t.length) {
        let command:string = t[i++]
        if (i < t.length) {
          if (command == "type") {
            this.type = t[i++]
          } else if (command == "para") {
            this.para = tokenizer.removePackage(t[i++])
          } else {
            console.error('Parsing error: Timer Event. ID ' + id + ': Unknown keyword ' + command)
          }
        } else {
          console.error('Parsing error: Timer Event. ID ' + id + ': Expecting value for ' + command)
        }
      }
    }
  }

  toModel():string {
		let out:string = "timer_event " + this.id + " {\n"
		if (this.type != "") {
			out += "  type " + this.type + "\n"
		}
    if (this.para != "") {
      out += "  para \"" + this.para + "\"\n"
    }
		out += "}\n"
		return out
	}
}