import {
  MMELDataAttribute,
  MMELDataClass,
  MMELRegistry,
} from '../serialize/interface/datainterface';
import { MMELModel } from '../serialize/interface/model';

export class DataLinkManager {
  map = new Map<MMELDataClass, DataClassAddon>();

  constructor(m: MMELModel, dcs: Map<string, MMELDataClass>) {
    for (const d of m.dataclasses) {
      const addon = this.get(d);
      addon.examine(dcs, d.attributes);
    }
    for (const r of m.regs) {
      if (r.data !== null) {
        this.get(r.data).mother = r;
      }
    }
  }

  get(x: MMELDataClass): DataClassAddon {
    const ret = this.map.get(x);
    if (ret !== undefined) {
      return ret;
    }
    const record = new DataClassAddon();
    this.map.set(x, record);
    return record;
  }
}

export class DataClassAddon {
  rdcs = new Set<MMELDataClass>();
  mother: MMELRegistry | null = null;

  examine(dcs: Map<string, MMELDataClass>, att: MMELDataAttribute[]) {
    this.rdcs.clear();
    for (const a of att) {
      let x = a.type;
      const i1 = x.indexOf('(');
      const i2 = x.indexOf(')');
      if (i1 !== -1 && i2 !== -1) {
        x = x.substr(i1 + 1, i2 - i1 - 1);
      }
      if (x !== '') {
        const ret = dcs.get(x);
        if (ret !== undefined) {
          this.rdcs.add(ret);
        }
      }
    }
  }
}
