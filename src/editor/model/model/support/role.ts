import * as tokenizer from '../../util/tokenizer'

export class Role {
  id:string = ""
  name:string = ""  

  constructor(id:string, data:string) {
    this.id = id    
    let t:Array<string> = tokenizer.tokenizePackage(data)
    let i:number  = 0
    while (i < t.length) {
      let command:string = t[i++]
      if (i < t.length) {
        if (command == "name") {
          this.name = tokenizer.removePackage(t[i++])
        } else {
          console.error('Parsing error: role. ID ' + id + ': Unknown keyword ' + command)
        }
      } else {
        console.error('Parsing error: role. ID ' + id + ': Expecting value for ' + command)
      }
    }  
  }

  toModel():string {    
    let out:string = "role " + this.id + " {\n"
    out += "  name \"" + this.name + "\"\n"
    out += "}\n"
    return out
  }
}