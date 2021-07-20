import React from 'react';
import { isNode } from 'react-flow-renderer';
import { MMELFactory } from '../../../runtime/modelComponentCreator';
import { DataType, MMELNode } from '../../../serialize/interface/baseinterface';
import {
  MMELSubprocess,
  MMELSubprocessComponent,
} from '../../../serialize/interface/flowcontrolinterface';
import { MMELProcess } from '../../../serialize/interface/processinterface';
import { isGraphNode } from '../../model/modelwrapper';
import { NodeData } from '../../nodecontainer';
import { MappedType } from '../component/mappinglegend';
import { ModelType, ModelViewStateMan } from '../model/mapperstate';
import { MappingProfile } from '../model/MappingProfile';
import { MapProfile } from '../model/profile';

export class MapperFunctions {
  static getRefStateMan: () => ModelViewStateMan;
  static getImpStateMan: () => ModelViewStateMan;
  static updateMap: () => void;
  static isMap: boolean;
  static setIsMap: (x: boolean) => void;

  static getStateMan(type: ModelType) {
    if (type === ModelType.ImplementationModel) {
      return MapperFunctions.getImpStateMan();
    } else {
      return MapperFunctions.getRefStateMan();
    }
  }

  static saveLayout(sm: ModelViewStateMan) {
    console.debug('Save Layout in Mapper', sm);
    const instance = sm.state.instance;
    const mw = sm.state.modelWrapper;
    if (instance !== null) {
      instance.getElements().forEach(x => {
        const data = x.data;
        const page = mw.page;
        const idreg = mw.idman;
        if (isNode(x) && data instanceof NodeData) {
          const gn = mw.subman.get(page).map.get(data.represent);
          if (gn !== undefined) {
            gn.x = x.position.x;
            gn.y = x.position.y;
          } else {
            const obj = idreg.nodes.get(data.represent);
            if (obj !== undefined) {
              const nc = MMELFactory.createSubprocessComponent(obj);
              if (
                obj.datatype === DataType.DATACLASS ||
                obj.datatype === DataType.REGISTRY
              ) {
                page.data.push(nc);
                nc.element = obj as MMELNode;
                nc.x = x.position.x;
                nc.y = x.position.y;
                mw.subman.get(page).map.set(data.represent, nc);
              } else if (isGraphNode(obj)) {
                page.childs.push(nc);
                nc.element = obj as MMELNode;
                nc.x = x.position.x;
                nc.y = x.position.y;
                mw.subman.get(page).map.set(data.represent, nc);
              }
            }
          }
        }
      });
    }
  }

  static getObjectByID(sm: ModelViewStateMan, id: string) {
    const idreg = sm.state.modelWrapper.idman;
    if (idreg.nodes.has(id)) {
      const ret = idreg.nodes.get(id);
      if (ret !== undefined && isGraphNode(ret)) {
        return ret;
      }
    }
    return undefined;
  }

  static addPageToHistory = (
    sm: ModelViewStateMan,
    x: MMELSubprocess,
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
    const mw = state.state.modelWrapper;
    if (refmodel.meta.namespace === '') {
      alert('Reference model does not have a non-empty namespace');
    } else {
      mw.mapman.addMapping(refmodel.meta.namespace, fromid, toid);
    }
    MapperFunctions.reCalculateMapped();
  }

  static updateMapRef(sm: ModelViewStateMan) {
    const state = sm.state;
    const elms = state.maps;
    const mw = state.modelWrapper;
    elms.clear();
    for (const c of mw.page.childs) {
      if (c.element?.datatype === DataType.PROCESS) {
        const id = c.element.id;
        elms.set(id, new MappingProfile(React.createRef<HTMLDivElement>()));
      }
    }
    MapperFunctions.updateMap();
  }

  static removeMapping(ns: string, source: string, target: string): void {
    const sm = MapperFunctions.getStateMan(ModelType.ImplementationModel);
    sm.state.modelWrapper.mapman.removeMapping(ns, source, target);
    sm.setState({ ...sm.state });
    MapperFunctions.reCalculateMapped();
    MapperFunctions.updateMap();
  }

  static reCalculateMapped() {
    const mapping = MapperFunctions.getStateMan(ModelType.ImplementationModel)
      .state.modelWrapper.mapman;
    const mw = MapperFunctions.getStateMan(ModelType.ReferenceModel).state
      .modelWrapper;
    mw.mapped.clear();
    const visited = new Set<MMELSubprocessComponent>();
    const map = mapping.getMapping(mw.model.meta.namespace);
    if (mw.model.root !== null) {
      for (const c of mw.model.root.childs) {
        explore(c, mw.mapped, map, visited);
      }
    }
  }
}

function explore(
  c: MMELSubprocessComponent,
  mapped: Map<string, MappedType>,
  data: MapProfile,
  visited: Set<MMELSubprocessComponent>
): MappedType | null {
  const mw = MapperFunctions.getStateMan(ModelType.ReferenceModel).state
    .modelWrapper;
  if (visited.has(c)) {
    if (c.element?.datatype === DataType.PROCESS) {
      const result = mapped.get(c.element.id);
      if (result !== undefined) {
        return result;
      }
    }
    return null;
  }
  visited.add(c);
  let result: MappedType | null;
  if (c.element !== null) {
    if (c.element.datatype === DataType.PROCESS) {
      const process = c.element as MMELProcess;
      const pid = process.id;
      const record = mapped.get(pid);
      if (record === undefined) {
        result = MappedType.None;
        const froms = data.tos.get(pid);
        if (froms !== undefined && froms.size > 0) {
          result = MappedType.FULL;
        } else if (process.page !== null) {
          const paddon = mw.subman.get(process.page);
          if (paddon.start !== null) {
            const r = explore(paddon.start, mapped, data, visited);
            if (r === null) {
              result = MappedType.None;
            } else {
              result = r;
            }
          }
        }
        mapped.set(pid, result);
      } else {
        result = record;
      }
    } else {
      result = null;
    }

    if (c.element.datatype === DataType.EGATE) {
      result = MappedType.None;
      for (const x of mw.comman.get(c).child) {
        if (x.to !== null) {
          const r = explore(x.to, mapped, data, visited);
          if (r !== null && r > result) {
            result = r;
          }
        }
      }
    } else {
      let good = false;
      let bad = false;
      if (c.element.datatype === DataType.PROCESS) {
        if (result === MappedType.PARTIAL) {
          good = true;
          bad = true;
        } else if (result === MappedType.None) {
          bad = true;
        } else if (result === MappedType.FULL) {
          good = true;
        }
      }
      for (const x of mw.comman.get(c).child) {
        if (x.to !== null) {
          const r = explore(x.to, mapped, data, visited);
          if (r === MappedType.PARTIAL) {
            good = true;
            bad = true;
          } else if (r === MappedType.None) {
            bad = true;
          } else if (r === MappedType.FULL) {
            good = true;
          }
        }
        if (good && bad) {
          result = MappedType.PARTIAL;
        } else if (good) {
          result = MappedType.FULL;
        } else if (bad) {
          result = MappedType.None;
        } else {
          result = null;
        }
      }
    }
    return result;
  }
  return null;
}
