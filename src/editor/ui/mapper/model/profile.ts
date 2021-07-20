export class Mapping {
  from: string;
  to: string;

  constructor(f: string, t: string) {
    this.from = f;
    this.to = t;
  }
}

export class MapProfile {
  id: string; // namespace of the reference model
  maps: Array<Mapping> = [];

  froms: Map<string, Set<string>> = new Map<string, Set<string>>();
  tos: Map<string, Set<string>> = new Map<string, Set<string>>();

  constructor(id: string) {
    this.id = id;
  }

  registerMapping(f: string, t: string): boolean {
    let s = this.froms.get(f);
    if (s === undefined) {
      s = new Set<string>();
      this.froms.set(f, s);
    }
    if (s.has(t)) {
      return false;
    }
    s.add(t);
    let s2 = this.tos.get(t);
    if (s2 === undefined) {
      s2 = new Set<string>();
      this.tos.set(t, s2);
    }
    s2.add(f);
    return true;
  }

  deleteMapping(fromid: string, toid: string) {
    const s = this.froms.get(fromid);
    if (s !== undefined) {
      s.delete(toid);
    }
    const t = this.tos.get(toid);
    if (t !== undefined) {
      t.delete(fromid);
    }
    this.maps.forEach((m, index) => {
      if (m.from === fromid && m.to === toid) {
        this.maps.splice(index, 1);
        return;
      }
    });
  }
}
