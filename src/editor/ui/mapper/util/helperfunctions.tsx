import React from 'react';
import { isNode } from 'react-flow-renderer';
import { Dataclass } from '../../../model/model/data/dataclass';
import { Registry } from '../../../model/model/data/registry';
import {
  Subprocess,
  SubprocessComponent,
} from '../../../model/model/flow/subprocess';
import { EGate } from '../../../model/model/gate/egate';
import { GraphNode } from '../../../model/model/graphnode';
import { MapProfile } from '../../../model/model/mapping/profile';
import { Process } from '../../../model/model/process/process';
import { NodeData } from '../../nodecontainer';
import { MappedType } from '../component/mappinglegend';
import { ModelType, ModelViewStateMan } from '../model/mapperstate';
import { MappingProfile } from '../model/MappingProfile';

export class MapperFunctions {
  static getRefStateMan: () => ModelViewStateMan;
  static getImpStateMan: () => ModelViewStateMan;
  static updateMap: () => void;
  static isMap: boolean;
  static setIsMap: (x: boolean) => void;

  static getStateMan(type: ModelType) {
    if (type == ModelType.ImplementationModel) {
      return MapperFunctions.getImpStateMan();
    } else {
      return MapperFunctions.getRefStateMan();
    }
  }

  static saveLayout(sm: ModelViewStateMan) {
    console.debug('Save Layout in Mapper', sm);
    const instance = sm.state.instance;
    const mw = sm.state.modelWrapper;
    if (instance != null) {
      instance.getElements().forEach(x => {
        const data = x.data;
        const page = mw.page;
        const idreg = mw.model.idreg;
        if (isNode(x) && data instanceof NodeData) {
          const gn = page.map.get(data.represent);
          if (gn != null) {
            gn.x = x.position.x;
            gn.y = x.position.y;
          } else {
            const obj = idreg.ids.get(data.represent);
            if (obj != undefined) {
              const nc = new SubprocessComponent(data.represent, '');
              if (obj instanceof Dataclass || obj instanceof Registry) {
                page.data.push(nc);
                nc.element = obj;
                nc.x = x.position.x;
                nc.y = x.position.y;
                page.map.set(data.represent, nc);
              } else if (obj instanceof GraphNode) {
                page.childs.push(nc);
                nc.element = obj;
                nc.x = x.position.x;
                nc.y = x.position.y;
                page.map.set(data.represent, nc);
              }
            }
          }
        }
      });
    }
  }

  static getObjectByID(sm: ModelViewStateMan, id: string) {
    const idreg = sm.state.modelWrapper.model.idreg;
    if (idreg.ids.has(id)) {
      const ret = idreg.ids.get(id);
      if (ret instanceof GraphNode) {
        return ret;
      }
    }
    return undefined;
  }

  static addPageToHistory = (
    sm: ModelViewStateMan,
    x: Subprocess,
    name: string
  ) => {
    const state = sm.state;
    MapperFunctions.saveLayout(sm);
    state.history.add(x, name);
    state.modelWrapper.page = x;
    MapperFunctions.updateMapRef(sm);
    sm.setState({ ...state });
  };

  static addMap(fromid: string, toid: string) {
    const state = MapperFunctions.getStateMan(ModelType.ImplementationModel);
    const refmodel = MapperFunctions.getStateMan(ModelType.ReferenceModel).state
      .modelWrapper.model;
    const model = state.state.modelWrapper.model;
    if (refmodel.meta.namespace == '') {
      alert('Reference model does not have a non-empty namespace');
    } else {
      model.maps.addMapping(refmodel.meta.namespace, fromid, toid);
    }
    MapperFunctions.reCalculateMapped();
  }

  static updateMapRef(sm: ModelViewStateMan) {
    const state = sm.state;
    const elms = state.maps;
    const mw = state.modelWrapper;
    elms.clear();
    for (const c of mw.page.childs) {
      if (c.element != null && c.element instanceof Process) {
        const id = c.element.id;
        elms.set(id, new MappingProfile(React.createRef<HTMLDivElement>()));
      }
    }
    MapperFunctions.updateMap();
  }

  static removeMapping(ns: string, source: string, target: string): void {
    const sm = MapperFunctions.getStateMan(ModelType.ImplementationModel);
    sm.state.modelWrapper.model.maps.removeMapping(ns, source, target);
    sm.setState({ ...sm.state });
    MapperFunctions.reCalculateMapped();
    MapperFunctions.updateMap();
  }

  static reCalculateMapped() {
    const mapping = MapperFunctions.getStateMan(ModelType.ImplementationModel)
      .state.modelWrapper.model.maps;
    const mw = MapperFunctions.getStateMan(ModelType.ReferenceModel).state
      .modelWrapper;
    mw.mapped.clear();
    const visited = new Set<SubprocessComponent>();
    const map = mapping.profiles.get(mw.model.meta.namespace);
    if (map != undefined && mw.model.root != null) {
      for (const c of mw.model.root.childs) {
        explore(c, mw.mapped, map, visited);
      }
    }
  }
}

function explore(
  c: SubprocessComponent,
  mapped: Map<string, MappedType>,
  data: MapProfile,
  visited: Set<SubprocessComponent>
): boolean {
  if (visited.has(c)) {
    if (c.element instanceof Process) {
      const result = mapped.get(c.element.id);
      if (result != undefined) {
        return result != MappedType.None;
      }
    }
    return true;
  }
  visited.add(c);
  let result = MappedType.Exact;
  let ret = false;
  if (c.element != null) {
    if (c.element instanceof Process) {
      const pid = c.element.id;
      const record = mapped.get(pid);
      if (record == undefined) {
        result = MappedType.None;
        const froms = data.tos.get(pid);
        if (froms != undefined && froms.size > 0) {
          result = MappedType.Exact;
        } else if (c.element.page != null && c.element.page.start != null) {
          const r = explore(c.element.page.start, mapped, data, visited);
          if (r) {
            result = MappedType.Exact;
          } else {
            for (const x of c.element.page.childs) {
              if (x.element != null && x.element instanceof Process) {
                const re = mapped.get(x.element.id);
                if (re != undefined) {
                  if (re != MappedType.None) {
                    result = MappedType.Component;
                    break;
                  }
                }
              }
            }
          }
        }
        mapped.set(pid, result);
      } else {
        result = record;
      }
    }

    if (c.element instanceof EGate) {
      ret = false;
      for (const x of c.child) {
        if (x.to != null) {
          const r = explore(x.to, mapped, data, visited);
          if (r) {
            ret = true;
          }
        }
      }
    } else {
      ret = result != MappedType.None;
      for (const x of c.child) {
        if (x.to != null) {
          const r = explore(x.to, mapped, data, visited);
          if (!r) {
            ret = false;
          }
        }
      }
    }
    return ret;
  }
  return false;
}
