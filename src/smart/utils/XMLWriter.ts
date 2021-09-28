export default function translateObjectToXML(obj: Object):string {
  return `<document>${objectToXML(obj)}</document>`;
}

function objectToXML(obj:Object): string {
  const entries = Object.entries(obj);
  let out = '';
  for (const [k, o] of entries) {
    let tag = k.replaceAll(/\s+/g, '').replaceAll(':', '');
    if (/^\d+$/.test(tag.charAt(0))) {
      tag = `clause${tag}`;
    }
    if (Array.isArray(o)) {
      out += getXMLElementFromArray(tag, o);
    } else {
      let content: string;
      if (o === null) {
        content = 'null';
      } else if (typeof o === 'object') {
        content = objectToXML(o);
      } else {
        content = o;
      }
      out += `<${tag}>${content}</${tag}>`;
    }
  }
  return out;
}

function getXMLElementFromArray(tag: string, array: Array<Object>): string {
  let out = '';
  for (const y of array) {
    let content: string;
    if (y === null) {
      content = 'null';
    } else if (typeof y === 'object') {
      content = objectToXML(y);
    } else {
      content = y;
    }
    out += `<${tag}>${content}</${tag}>`;
  }
  return out;
}