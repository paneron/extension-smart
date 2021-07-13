import { XMLElement } from "./xmlelement"

export class XMLParser {
 
  static parse(data:string):XMLElement {
    data = removeComments(data)
    let tokens = tokenize(data)    
    let xml = parse(tokens)    
    console.debug("XML parsing done", xml)
    return xml
  }

}

class Token {
  data:string
  type:TokenType

  constructor(x:string, t:TokenType) {
    this.data = x
    this.type = t
  }
}

enum TokenType {
  STARTTAG,
  ENDTAG,
  SELFCLOSETAG,
  TEXT
}

function tokenize(x:string) {
  let tagreg = /<[^<]*?>/
  let selftagreg = /<[^<]*?\/>/
  let endtagreg = /<\/[^<]*?>/
  let out:Array<Token> = []  
  let tags = x.match(tagreg)
  while (tags != null && tags.length > 0) {
    let index = x.indexOf(tags[0])
    let front = x.substr(0, index)
    if (!isSpace(front)) {
      out.push(new Token(front, TokenType.TEXT))
    }
    if (selftagreg.test(tags[0])) {
      out.push(new Token(tags[0], TokenType.SELFCLOSETAG))
    } else if (endtagreg.test(tags[0])) {
      out.push(new Token(tags[0], TokenType.ENDTAG))
    } else {
      out.push(new Token(tags[0], TokenType.STARTTAG))
    }
    x = x.substr(index+tags[0].length)
    tags = x.match(tagreg)
  }
  return out
}

function removeComments(data:string) {
  let out = data.replaceAll(/<\?.*?\?>/g, "")
  out = out.replaceAll(/<!--.*?-->/g, "")  
  return out
}

function parse(data:Array<Token>):XMLElement {
  if (data.length == 0 || (data[0].type != TokenType.STARTTAG && data[0].type != TokenType.SELFCLOSETAG)) {
    console.error("Not a valid XML document", data)
    return new XMLElement("")
  }
  let first = data[0]  
  let elm:XMLElement
  if (first.type == TokenType.STARTTAG) {
    elm = parseStartTagContents(first.data.substr(1, first.data.length-2))
  } else {
    elm = parseStartTagContents(first.data.substr(1, first.data.length-3))
  }
  let pos = parseTokens(data, 1, elm)
  if (pos < data.length) {
    console.error("Still some elements after the root elements", data, pos)
  }
  return elm
}

function parseTokens(token:Array<Token>, pos:number, elm:XMLElement):number {
  while (pos < token.length) {
    let t = token[pos++]
    if (t.type == TokenType.SELFCLOSETAG) {
      elm.addChild(parseStartTagContents(t.data.substr(1, t.data.length-3)))
    } else if (t.type == TokenType.ENDTAG) {
      let name = t.data.substr(2, t.data.length-3)
      if (name != elm.tag) {
        console.error("End tag does not match start tag", elm, t)
      }
      return pos
    } else if (t.type == TokenType.TEXT) {
      elm.addChild(t.data)
    } else {
      // Start Tag type
      let e = parseStartTagContents(t.data.substr(1, t.data.length-2))
      elm.addChild(e)
      pos = parseTokens(token, pos, e)
    }    
  }
  console.error("Unexpected end of tokens")
  return 0
}

function parseStartTagContents(t:string):XMLElement {
  let parts = t.split(/\s+/)
  if (parts.length > 0) {
    let name = parts[0]
    let elm = new XMLElement(name)
    parts.splice(0, 1)
    parts.forEach((x) => {
      let part = x.split("=")
      if (part.length > 2) {
        console.error("Parse error. Too many =", x)
      } else if (part.length == 2) {
        elm.attributes.set(part[0], part[1])
      } else if (part.length == 1) {
        elm.attributes.set(part[0], "")
      } else {
        console.error("Parse error. No =", x)
      }
    })
    return elm
  }
  console.error("Parse error. No element name found", t)
  return new XMLElement("")
}

function isSpace(x:string):boolean {
  return /^\s*$/.test(x)
}