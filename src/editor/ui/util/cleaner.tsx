// centralize all the functions for cleaning up the model when removing something (e.g., process)

import { functionCollection } from './function';
import {
  MMELApproval,
  MMELProcess,
} from '../../serialize/interface/processinterface';
import {
  MMELGateway,
  MMELSubprocess,
  MMELSubprocessComponent,
} from '../../serialize/interface/flowcontrolinterface';
import { DataType, MMELNode } from '../../serialize/interface/baseinterface';
import { isEventNode, isGate } from '../model/modelwrapper';
import { MMELEventNode } from '../../serialize/interface/eventinterface';

export class Cleaner {
  static removeProcess(process: MMELProcess) {
    const sm = functionCollection.getStateMan();
    const state = sm.state;
    const model = state.modelWrapper.model;

    const found = Cleaner.removeGraphNode(process);
    const idreg = state.modelWrapper.idman;
    if (!found) {
      const index = model.processes.indexOf(process);
      model.processes.splice(index, 1);
      idreg.nodes.delete(process.id);
      Cleaner.cleanProvisions(process);
    }
    if (process.page !== null) {
      Cleaner.killPage(process.page);
    }
    sm.setState({ ...state });
  }

  static killPage(page: MMELSubprocess) {
    const sm = functionCollection.getStateMan();
    const state = sm.state;
    const model = state.modelWrapper.model;
    const idreg = state.modelWrapper.idman;

    const childHandle = (c: MMELSubprocessComponent) => {
      const mw = functionCollection.getStateMan().state.modelWrapper;
      if (c.element !== null) {
        const x = c.element;
        const addon = mw.nodeman.get(x);
        addon.pages.delete(page);
        if (
          !(x.datatype === DataType.DATACLASS ||
            x.datatype === DataType.REGISTRY)
        ) {
          if (addon.pages.size === 0) {
            idreg.nodes.delete(x.id);
            if (x.datatype === DataType.PROCESS) {
              const process = x as MMELProcess;
              const index = model.processes.indexOf(process);
              model.processes.splice(index, 1);
              Cleaner.cleanProvisions(process);
              if (process.page !== null) {
                Cleaner.killPage(process.page);
              }
            } else if (x.datatype === DataType.APPROVAL) {
              const app = x as MMELApproval;
              const index = model.approvals.indexOf(app);
              model.approvals.splice(index, 1);
            } else if (isEventNode(x)) {
              const index = model.events.indexOf(x);
              model.events.splice(index, 1);
            } else if (isGate(x)) {
              const index = model.gateways.indexOf(x);
              model.gateways.splice(index, 1);
            }
          }
        }
      }
    };

    page.childs.forEach(childHandle);
    page.data.forEach(childHandle);

    const index = model.pages.indexOf(page);
    model.pages.splice(index, 1);
  }

  static cleanProvisions(process: MMELProcess) {
    const sm = functionCollection.getStateMan();
    const state = sm.state;
    const model = state.modelWrapper.model;
    const idreg = state.modelWrapper.idman;
    process.provision.map(p => {
      idreg.provisions.delete(p.id);
      const index = model.provisions.indexOf(p);
      model.provisions.splice(index, 1);
    });
    process.provision = [];
  }

  // return true if the removed node is not the last appearance
  static removeGraphNode(x: MMELNode): boolean {
    const sm = functionCollection.getStateMan();
    const state = sm.state;
    const idreg = state.modelWrapper.idman;
    const page = sm.state.modelWrapper.page;

    page.childs.forEach((c, index) => {
      if (c.element === x) {
        page.childs.splice(index, 1);
        state.modelWrapper.nodeman.get(x).pages.delete(page);
        state.modelWrapper.subman.get(page).map.delete(x.id);
      }
    });

    page.data.forEach((c, index) => {
      if (c.element === x) {
        page.data.splice(index, 1);
        state.modelWrapper.nodeman.get(x).pages.delete(page);
        state.modelWrapper.subman.get(page).map.delete(x.id);
      }
    });

    for (let i = page.edges.length - 1; i >= 0; i--) {
      const e = page.edges[i];
      if (e.from?.element === x || e.to?.element === x) {
        page.edges.splice(i, 1);
        idreg.edges.delete(e.id);
        if (e.to?.element === x) {
          const index = state.modelWrapper.comman.get(e.from!).child.indexOf(e);
          if (index >= 0) {
            state.modelWrapper.comman.get(e.from!).child.splice(index, 1);
          }
        }
      }
    }

    return state.modelWrapper.nodeman.get(x).pages.size > 0;
  }

  static removeApproval(a: MMELApproval) {
    const sm = functionCollection.getStateMan();
    const state = sm.state;
    const model = state.modelWrapper.model;

    const found = Cleaner.removeGraphNode(a);
    const idreg = state.modelWrapper.idman;
    if (!found) {
      const index = model.approvals.indexOf(a);
      model.approvals.splice(index, 1);
      idreg.nodes.delete(a.id);
    }
    sm.setState({ ...state });
  }

  static removeGate(e: MMELGateway) {
    const sm = functionCollection.getStateMan();
    const state = sm.state;
    const model = state.modelWrapper.model;

    const found = Cleaner.removeGraphNode(e);
    const idreg = state.modelWrapper.idman;
    if (!found) {
      const index = model.gateways.indexOf(e);
      model.gateways.splice(index, 1);
      idreg.nodes.delete(e.id);
    }
    sm.setState({ ...state });
  }

  static removeEvent(e: MMELEventNode) {
    const sm = functionCollection.getStateMan();
    const state = sm.state;
    const model = state.modelWrapper.model;

    const found = Cleaner.removeGraphNode(e);
    const idreg = state.modelWrapper.idman;
    if (!found) {
      const index = model.events.indexOf(e);
      model.events.splice(index, 1);
      idreg.nodes.delete(e.id);
    }
    sm.setState({ ...state });
  }

  static removeEdge(source: string, target: string) {
    const sm = functionCollection.getStateMan();
    const state = sm.state;
    const mw = state.modelWrapper;
    const page = state.modelWrapper.page;
    const idreg = state.modelWrapper.idman;
    const paddon = mw.subman.get(page);

    const s = paddon.map.get(source);
    const t = paddon.map.get(target);
    if (s !== undefined && t !== undefined) {
      page.edges.forEach((e, index) => {
        if (e.from === s && e.to === t) {
          page.edges.splice(index, 1);
          idreg.edges.delete(e.id);
          sm.setState({ ...state });
          return;
        }
      });
    }
  }
}
