import {
  XMLElement,
  XMLNodeContent,
  XMLToken,
  XMLTokenType,
} from '../../model/xmlelement';

export function parseXML(data: string): XMLElement {
  data = removeComments(data);
  const tokens = tokenize(data);
  const xml = parse(tokens);
  return xml;
}

function removeComments(data: string) {
  let out = data.replaceAll(/<\?.*?\?>/g, '');
  out = out.replaceAll(/<!--.*?-->/g, '');
  return out;
}

function tokenize(x: string) {
  const tagreg = /<[^<]*?>/;
  const selftagreg = /<[^<]*?\/>/;
  const endtagreg = /<\/[^<]*?>/;
  const out: XMLToken[] = [];
  let tags = x.match(tagreg);
  while (tags !== null && tags.length > 0) {
    const index = x.indexOf(tags[0]);
    const front = x.substring(0, index);
    if (!isSpace(front)) {
      out.push({ data : front, type : XMLTokenType.TEXT });
    }
    if (selftagreg.test(tags[0])) {
      out.push({ data : tags[0], type : XMLTokenType.SELFCLOSETAG });
    } else if (endtagreg.test(tags[0])) {
      out.push({ data : tags[0], type : XMLTokenType.ENDTAG });
    } else {
      out.push({ data : tags[0], type : XMLTokenType.STARTTAG });
    }
    x = x.substring(index + tags[0].length);
    tags = x.match(tagreg);
  }
  return out;
}

function parse(data: XMLToken[]): XMLElement {
  if (
    data.length === 0 ||
    (data[0].type !== XMLTokenType.STARTTAG &&
      data[0].type !== XMLTokenType.SELFCLOSETAG)
  ) {
    throw new Error(`Not a valid XML document ${data[0].data}`);
  }
  const first = data[0];
  const elm: XMLElement = parseStartTagContents(
    first.data.substring(
      1,
      first.type === XMLTokenType.STARTTAG
        ? first.data.length - 1
        : first.data.length - 2
    )
  );
  const pos = parseTokens(data, 1, elm);
  if (pos < data.length) {
    throw new Error(`Still some elements after the root elements, pos: ${pos}`);
  }
  return elm;
}

function parseTokens(token: XMLToken[], pos: number, elm: XMLElement): number {
  while (pos < token.length) {
    const t = token[pos++];
    if (t.type === XMLTokenType.SELFCLOSETAG) {
      const child = parseStartTagContents(
        t.data.substring(1, t.data.length - 2)
      );
      addChildToElement(elm, child.tag, child);
      elm.childs.push(child);
    } else if (t.type === XMLTokenType.ENDTAG) {
      const name = t.data.substring(2, t.data.length - 1);
      if (name !== elm.tag) {
        throw new Error(`End tag does not match start tag ${elm.tag} ${t}`);
      }
      return pos;
    } else if (t.type === XMLTokenType.TEXT) {
      elm.childs.push(t.data);
    } else {
      // Start Tag type
      const e = parseStartTagContents(t.data.substring(1, t.data.length - 1));
      addChildToElement(elm, e.tag, e);
      elm.childs.push(e);
      pos = parseTokens(token, pos, e);
    }
  }
  throw new Error('Unexpected end of tokens');
}

function parseStartTagContents(t: string): XMLElement {
  const parts = t.split(/\s+/);
  if (parts.length > 0) {
    const name = parts[0];
    const elm = createXMLElement(name);
    if (name !== 'image') {
      // image content is ignored at the moment
      parts.splice(0, 1);
      for (const x of parts) {
        const part = x.split('=');
        if (part.length > 2) {
          throw new Error(
            `Parse error. Too many = for an attribute declaration: ${x}`
          );
        } else if (part.length === 2) {
          elm.attributes[part[0]] = part[1].substring(1, part[1].length - 1);
        } else if (part.length === 1) {
          elm.attributes[part[0]] = '';
        } else {
          throw new Error(`Empty attribute is not filtered. ${x}`);
        }
      }
    }
    return elm;
  }
  throw new Error(`Parse error. No element name found ${t}`);
}

function isSpace(x: string): boolean {
  return /^\s*$/.test(x);
}

function createXMLElement(tag: string): XMLElement {
  return {
    tag,
    attributes : {},
    childs     : [],
    xmlChild   : {},
  };
}

function addChildToElement(elm: XMLElement, tag: string, child: XMLElement) {
  const array = elm.xmlChild[tag];
  if (array !== undefined) {
    array.push(child);
  } else {
    elm.xmlChild[tag] = [child];
  }
}

export function elementToString(xml: XMLElement): string {
  let out = '';
  for (const c of xml.childs) {
    if (isXMLElement(c)) {
      out += ' ' + elementToString(c).trim();
    } else {
      out += ' ' + c.trim();
    }
  }
  return out.trim();
}

export function isXMLElement(c: XMLNodeContent): c is XMLElement {
  return typeof c === 'object';
}
