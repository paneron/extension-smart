import { Elements } from 'react-flow-renderer';
import { NodeContainer } from '../nodecontainer';
import { EdgeContainer } from '../edgecontainer';
import { DataLinkContainer } from '../datalinkcontainer';
import { ModelType } from '../mapper/model/mapperstate';
import { MappedType } from '../mapper/component/mappinglegend';
import { DataType, MMELObject } from '../../serialize/interface/baseinterface';
import { MMELModel } from '../../serialize/interface/model';
import { MMELSubprocess } from '../../serialize/interface/flowcontrolinterface';
import { VisualManager } from '../../runtime/visualManager';
import { FilterManager } from '../../runtime/filterManager';
import { IDManager } from '../../runtime/idManager';
import {
  MMELDataClass,
  MMELRegistry,
} from '../../serialize/interface/datainterface';
import {
  MMELApproval,
  MMELProcess,
} from '../../serialize/interface/processinterface';
import { SubprocessManager } from '../../runtime/subprocessManager';
import { CheckListManager } from '../../runtime/checklistManager';
import { DataLinkManager } from '../../runtime/datalinkManager';
import { SubprocessComponentManager } from '../../runtime/componentManager';
import { MappingManager } from '../mapper/util/mappingmanager';
import { NodeManager } from '../../runtime/nodeManager';

export class ModelWrapper {
  model: MMELModel;

  page: MMELSubprocess;

  mapped: Map<string, MappedType> = new Map<string, MappedType>();

  visualman = new VisualManager();
  filterman = new FilterManager();
  clman = new CheckListManager();
  dlman: DataLinkManager;
  subman: SubprocessManager;
  idman: IDManager;
  comman: SubprocessComponentManager;
  mapman = new MappingManager();
  nodeman: NodeManager;

  lastvisible = true;

  constructor(m: MMELModel) {
    this.model = m;
    if (m.root === null) {
      throw new Error(
        'Model structure is corrupted. Model does not contain a root'
      );
    } else {
      this.page = m.root;
    }
    this.idman = new IDManager(m);
    this.subman = new SubprocessManager(m);
    this.dlman = new DataLinkManager(m, this.idman.dcs);
    this.comman = new SubprocessComponentManager(m);
    this.nodeman = new NodeManager(m);
    this.filterman.readDocu(m.refs);
  }

  getReactFlowElementsFrom(
    dvisible: boolean,
    clvisible: boolean,
    type?: ModelType
  ): Elements {
    this.visualman.reset();

    const elms: Elements = [];
    const datas = new Map<string, MMELRegistry | MMELDataClass>();

    this.page.childs.forEach(x => {
      const y = x.element;

      if (y !== null) {
        const exploreDataNode = (r: MMELRegistry, incoming: boolean) => {
          if (!this.visualman.has(r)) {
            datas.set(r.id, r);
            this.visualman.add(r);
            this.exploreData(r, datas, elms, dvisible);
          }
          if (y !== null) {
            const ne = incoming
              ? new DataLinkContainer(r, y)
              : new DataLinkContainer(y, r);
            ne.isHidden = !dvisible;
            elms.push(ne);
          }
        };

        const nn = new NodeContainer(y, { x: x.x, y: x.y });
        if (type !== undefined) {
          nn.data.modelType = type;
        }
        elms.push(nn);

        this.visualman.add(y);
        if (dvisible) {
          if (y.datatype === DataType.PROCESS) {
            const process = y as MMELProcess;
            process.input.map(r => exploreDataNode(r, true));
            process.output.map(r => exploreDataNode(r, false));
          }
          if (y.datatype === DataType.APPROVAL) {
            const app = y as MMELApproval;
            app.records.map(r => exploreDataNode(r, false));
          }
        }
      }
    });

    if (dvisible) {
      this.page.data.forEach(e => {
        if (e.element !== null) {
          const x = datas.get(e.element.id);
          if (x !== undefined) {
            const nn = new NodeContainer(x, { x: e.x, y: e.y });
            if (type !== undefined) {
              nn.data.modelType = type;
            }
            elms.push(nn);
            datas.delete(x.id);
          }
        }
      });
      datas.forEach(e => {
        const nn = new NodeContainer(e, { x: 0, y: 0 });
        if (type !== undefined) {
          nn.data.modelType = type;
        }
        elms.push(nn);
      });
      datas.forEach(d => {
        const map = this.subman.get(this.page).map;
        const sc = map.get(d.id);
        if (sc !== undefined) {
          const index = this.page.data.indexOf(sc);
          if (index !== -1) {
            this.page.data.splice(index, 1);
          }
        }
      });
    }

    this.page.edges.forEach(e => {
      const ec = new EdgeContainer(e);
      if (clvisible) {
        if (this.clman.getEdgeAddOn(e).isDone) {
          ec.animated = true;
          ec.style = { stroke: 'green' };
        } else {
          ec.animated = false;
          ec.style = { stroke: 'black' };
        }
      }
      elms.push(ec);
    });

    return elms;
  }

  exploreData(
    x: MMELRegistry,
    es: Map<string, MMELRegistry | MMELDataClass>,
    elms: Elements,
    dvisible: boolean
  ) {
    if (x.data !== null) {
      this.dlman.get(x.data).rdcs.forEach(e => {
        const m = this.dlman.get(e).mother;
        if (m !== null) {
          if (!this.visualman.has(m)) {
            es.set(m.id, m);
            this.visualman.add(m);
            this.exploreData(m, es, elms, dvisible);
          }
          const ne = new DataLinkContainer(x, m);
          elms.push(ne);
        } else {
          if (!this.visualman.has(e)) {
            es.set(e.id, e);
            this.visualman.add(e);
          }
          const ne = new DataLinkContainer(x, e);
          elms.push(ne);
        }
      });
    }
  }
}

export function isGraphNode(x: MMELObject) {
  return (
    x.datatype === DataType.REGISTRY ||
    x.datatype === DataType.DATACLASS ||
    x.datatype === DataType.ENDEVENT ||
    x.datatype === DataType.STARTEVENT ||
    x.datatype === DataType.SIGNALCATCHEVENT ||
    x.datatype === DataType.TIMEREVENT ||
    x.datatype === DataType.EGATE ||
    x.datatype === DataType.APPROVAL ||
    x.datatype === DataType.PROCESS
  );
}

export function isEventNode(x: MMELObject) {
  return (
    x.datatype === DataType.ENDEVENT ||
    x.datatype === DataType.STARTEVENT ||
    x.datatype === DataType.SIGNALCATCHEVENT ||
    x.datatype === DataType.TIMEREVENT
  );
}

export function isGate(x: MMELObject) {
  return x.datatype === DataType.EGATE;
}
