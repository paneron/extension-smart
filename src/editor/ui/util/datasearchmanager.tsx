import { DataType } from '../../serialize/interface/baseinterface';
import { MMELRegistry } from '../../serialize/interface/datainterface';
import {
  MMELSubprocess,
  MMELSubprocessComponent,
} from '../../serialize/interface/flowcontrolinterface';
import {
  MMELApproval,
  MMELProcess,
} from '../../serialize/interface/processinterface';
import { PageHistory } from '../model/history';
import { ModelWrapper } from '../model/modelwrapper';

export class DataIndexer {
  map = new Map<MMELRegistry, Array<DataIndexRecord>>();

  get(d: MMELRegistry) {
    let ret = this.map.get(d);
    if (ret === undefined) {
      ret = [];
      this.map.set(d, ret);
    }
    return ret;
  }

  static populateIndex(mw: ModelWrapper): DataIndexer {
    const index = new DataIndexer();
    if (mw.model.root !== null) {
      visitNode(
        mw.model.root,
        new PageHistory(null),
        index,
        new Set<MMELSubprocess>()
      );
    }
    return index;
  }
}

function visitNode(
  page: MMELSubprocess,
  history: PageHistory,
  index: DataIndexer,
  visited: Set<MMELSubprocess>
) {
  if (!visited.has(page)) {
    visited.add(page);
    for (const c of page.childs) {
      if (c.element?.datatype === DataType.PROCESS) {
        const process = c.element as MMELProcess;
        for (const input of process.input) {
          index.get(input).push(new DataIndexRecord(history, c, 'Input'));
        }
        for (const output of process.output) {
          index.get(output).push(new DataIndexRecord(history, c, 'Output'));
        }
        if (process.page !== null) {
          history.add(process.page, process.id);
          visitNode(process.page, history, index, visited);
          history.pop();
        }
      } else if (c.element?.datatype === DataType.APPROVAL) {
        const app = c.element as MMELApproval;
        for (const record of app.records) {
          index
            .get(record)
            .push(new DataIndexRecord(history, c, 'Approval record'));
        }
      }
    }
  }
}

export class DataIndexRecord {
  history: PageHistory;
  elm: MMELSubprocessComponent;
  type: string;

  constructor(ref: PageHistory, e: MMELSubprocessComponent, type: string) {
    this.history = new PageHistory(ref.modelType);
    this.history.copyContent(ref);
    this.elm = e;
    this.type = type;
  }
}
