import { MMELNode } from '../serialize/interface/baseinterface';
import { MMELSubprocess } from '../serialize/interface/flowcontrolinterface';
import { MMELModel } from '../serialize/interface/model';

export class NodeManager {
  map = new Map<MMELNode, NodeAddon>();

  constructor(m: MMELModel) {
    for (const p of m.pages) {
      for (const c of p.childs) {
        if (c.element !== null) {
          const addon = this.get(c.element);
          addon.pages.add(p);
        }
      }
    }
  }

  get(x: MMELNode): NodeAddon {
    const ret = this.map.get(x);
    if (ret !== undefined) {
      return ret;
    }
    const record = new NodeAddon();
    this.map.set(x, record);
    return record;
  }
}

export class NodeAddon {
  pages: Set<MMELSubprocess> = new Set<MMELSubprocess>();
  parent: Array<MMELNode> = [];
}
