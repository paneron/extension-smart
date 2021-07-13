import { Mapping } from '../../../model/model/mapping/mapping';
import { MapProfile } from '../../../model/model/mapping/profile';

export class MappingManager {
  profiles: Map<string, MapProfile>;

  constructor() {
    this.profiles = new Map<string, MapProfile>();
  }

  toModel(): string {
    let out = '';
    this.profiles.forEach(p => {
      out += p.toModel() + '\n';
    });
    return out;
  }

  addProfile(p: MapProfile) {
    this.profiles.set(p.id, p);
  }

  addMapping(namespace: string, fromid: string, toid: string) {
    let p = this.profiles.get(namespace);
    if (p == undefined) {
      p = new MapProfile(namespace, '');
      this.profiles.set(namespace, p);
    }
    if (p.registerMapping(fromid, toid)) {
      const m = new Mapping('');
      m.from = fromid;
      m.to = toid;
      p.maps.push(m);
    }
  }

  removeMapping(namespace: string, fromid: string, toid: string) {
    let p = this.profiles.get(namespace);
    if (p == undefined) {
      p = new MapProfile(namespace, '');
      this.profiles.set(namespace, p);
    }
    p.deleteMapping(fromid, toid);
  }
}
