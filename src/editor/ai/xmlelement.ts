export class XMLElement {
  tag: string;
  attributes = new Map<string, string>();
  private childs: Array<XMLElement | string> = [];

  map = new Map<string, Array<XMLElement>>();

  constructor(tag: string) {
    this.tag = tag;
  }

  addChild(c: XMLElement | string) {
    this.childs.push(c);
    if (c instanceof XMLElement) {
      let array = this.map.get(c.tag);
      if (array === undefined) {
        array = [];
        this.map.set(c.tag, array);
      }
      array.push(c);
    }
  }

  getChilds() {
    return this.childs;
  }

  getChildByTagName(x: string): Array<XMLElement> {
    const array = this.map.get(x);
    if (array === undefined) {
      return [];
    }
    return array;
  }

  getElementValue(name: string): string {
    const array = this.map.get(name);
    if (array === undefined) {
      return '';
    }
    return array[0].toString();
  }

  getElementValueByPath(path: Array<string>): string {
    let c: XMLElement = this;
    path.forEach(x => {
      const childs = c.getChildByTagName(x);
      if (childs.length === 0) {
        return '';
      } else {
        c = childs[0];
        return;
      }
    });
    return c.toString();
  }

  toString(): string {
    let out = '';
    this.childs.forEach(c => {
      if (c instanceof XMLElement) {
        out += ' ' + c.toString().trim();
      } else {
        out += ' ' + c.trim();
      }
    });
    return out.trim();
  }
}
