import { MMELRegistry } from '../serialize/interface/datainterface';

export class DocumentStore {
  regs: Map<string, DocumentRegistry>;

  constructor() {
    this.regs = new Map<string, DocumentRegistry>();
  }

  get(x: MMELRegistry): DocumentRegistry {
    if (this.regs.has(x.id)) {
      const y = this.regs.get(x.id);
      if (y !== undefined) {
        return y;
      }
    }
    const y = new DocumentRegistry();
    this.regs.set(x.id, y);
    return y;
  }
}

export class DocumentRegistry {
  docs: Map<number, DocumentItem>;

  constructor() {
    this.docs = new Map<number, DocumentItem>();
  }

  createNewDocument() {
    let id = Math.ceil(Math.random() * 10000000);
    while (this.docs.has(id)) {
      id = Math.ceil(Math.random() * 10000000);
    }
    return new DocumentItem(id);
  }

  get(x: number) {
    if (this.docs.has(x)) {
      const y = this.docs.get(x);
      if (y !== undefined) {
        return y;
      }
    }
    const y = new DocumentItem(x);
    return y;
  }
}

export class DocumentItem {
  id: number;
  meta: string;
  attributes: Map<string, string>;

  constructor(x: number) {
    this.id = x;
    this.meta = '';
    this.attributes = new Map<string, string>();
  }
}
