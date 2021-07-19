import { DataType } from '../serialize/interface/baseinterface';
import {
  MMELSubprocess,
  MMELSubprocessComponent,
} from '../serialize/interface/flowcontrolinterface';
import { MMELModel } from '../serialize/interface/model';

export class SubprocessManager {
  map = new Map<MMELSubprocess, SubprocessAddon>();

  constructor(m: MMELModel) {
    for (const p of m.pages) {
      const addon = this.get(p);
      for (const c of p.childs) {
        if (c.element?.datatype === DataType.STARTEVENT) {
          addon.start = c;
        }
        if (c.element !== null) {
          addon.map.set(c.element.id, c);
        }
      }
      for (const c of p.data) {
        if (c.element !== null) {
          addon.map.set(c.element.id, c);
        }
      }
    }
  }

  get(x: MMELSubprocess): SubprocessAddon {
    const ret = this.map.get(x);
    if (ret !== undefined) {
      return ret;
    }
    const record = new SubprocessAddon();
    this.map.set(x, record);
    return record;
  }
}

export class SubprocessAddon {
  map = new Map<string, MMELSubprocessComponent>();
  start: MMELSubprocessComponent | null = null;
}
