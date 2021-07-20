import { Mapping, MapProfile } from '../model/profile';

export class MappingManager {
  profiles: Map<string, MapProfile>;

  constructor() {
    this.profiles = new Map<string, MapProfile>();
  }

  addProfile(p: MapProfile) {
    this.profiles.set(p.id, p);
  }

  addMapping(namespace: string, fromid: string, toid: string) {
    let p = this.profiles.get(namespace);
    if (p === undefined) {
      p = new MapProfile(namespace);
      this.profiles.set(namespace, p);
    }
    if (p.registerMapping(fromid, toid)) {
      const m = new Mapping(fromid, toid);
      p.maps.push(m);
    }
  }

  removeMapping(namespace: string, fromid: string, toid: string) {
    let p = this.profiles.get(namespace);
    if (p === undefined) {
      p = new MapProfile(namespace);
      this.profiles.set(namespace, p);
    }
    p.deleteMapping(fromid, toid);
  }

  getMapping(key: string): MapProfile {
    let ret = this.profiles.get(key);
    if (ret === undefined) {
      ret = new MapProfile(key);
      this.profiles.set(key, ret);
    }
    return ret;
  }
}
