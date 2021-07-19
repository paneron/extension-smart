import {
  MMELEdge,
  MMELSubprocessComponent,
} from '../serialize/interface/flowcontrolinterface';
import { MMELModel } from '../serialize/interface/model';

export class SubprocessComponentManager {
  map = new Map<MMELSubprocessComponent, SubprocessComponentAddon>();

  constructor(m: MMELModel) {
    for (const p of m.pages) {
      for (const e of p.edges) {
        if (e.from !== null && e.to !== null) {
          this.get(e.from).child.push(e);
        }
      }
    }
  }

  get(x: MMELSubprocessComponent): SubprocessComponentAddon {
    const ret = this.map.get(x);
    if (ret !== undefined) {
      return ret;
    }
    const record = new SubprocessComponentAddon();
    this.map.set(x, record);
    return record;
  }
}

export class SubprocessComponentAddon {
  child: Array<MMELEdge> = [];
}
