import * as tokenizer from '../../util/tokenizer';
import { Mapping } from './mapping';

export class MapProfile {
  id: string; // namespace of the reference model
  maps: Array<Mapping> = [];

  froms: Map<string, Set<string>> = new Map<string, Set<string>>();
  tos: Map<string, Set<string>> = new Map<string, Set<string>>();

  constructor(id: string, data: string) {
    this.id = id;
    if (data != '') {
      const t: Array<string> = tokenizer.tokenizePackage(data);
      let i = 0;
      while (i < t.length) {
        const command: string = t[i++];
        if (i < t.length) {
          if (command == 'mapping') {
            const m = new Mapping(t[i++]);
            this.maps.push(m);
            if (!this.registerMapping(m.from, m.to)) {
              console.error('Parsing error: duplicated mapping', m);
            }
          } else {
            console.error('Parsing error: mapping. Unknown keyword ' + command);
          }
        } else {
          console.error(
            'Parsing error: mapping. Expecting value for ' + command
          );
        }
      }
    }
  }

  toModel(): string {
    let out: string = 'map_profile ' + this.id + ' {\n';
    this.maps.forEach(m => {
      out += m.toModel();
    });
    out += '}\n';
    return out;
  }

  // return false if the mapping already exists
  registerMapping(f: string, t: string): boolean {
    let s = this.froms.get(f);
    if (s == undefined) {
      s = new Set<string>();
      this.froms.set(f, s);
    }
    if (s.has(t)) {
      return false;
    }
    s.add(t);
    let s2 = this.tos.get(t);
    if (s2 == undefined) {
      s2 = new Set<string>();
      this.tos.set(t, s2);
    }
    s2.add(f);
    return true;
  }

  deleteMapping(fromid: string, toid: string) {
    const s = this.froms.get(fromid);
    if (s != undefined) {
      s.delete(toid);
    }
    const t = this.tos.get(toid);
    if (t != undefined) {
      t.delete(fromid);
    }
    this.maps.forEach((m, index) => {
      if (m.from == fromid && m.to == toid) {
        this.maps.splice(index, 1);
        return;
      }
    });
  }
}
