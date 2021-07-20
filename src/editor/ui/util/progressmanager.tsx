/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { jsx } from '@emotion/react';
import styled from '@emotion/styled';
import { DataType, MMELNode } from '../../serialize/interface/baseinterface';
import {
  MMELDataAttribute,
  MMELDataClass,
  MMELRegistry,
} from '../../serialize/interface/datainterface';
import {
  MMELEGate,
  MMELSubprocess,
  MMELSubprocessComponent,
} from '../../serialize/interface/flowcontrolinterface';
import {
  MMELApproval,
  MMELProcess,
} from '../../serialize/interface/processinterface';
import { MMELProvision } from '../../serialize/interface/supportinterface';
import { ModelWrapper } from '../model/modelwrapper';
import { functionCollection } from './function';

export class ProgressManager {
  static initProgressManager() {
    const mw = functionCollection.getStateMan().state.modelWrapper;
    console.debug('Recalculate jobs');
    const visited = new Set<MMELSubprocessComponent>();
    const model = mw.model;
    if (model.root !== null) {
      const start = mw.subman.get(model.root).start;
      if (start !== null) {
        exploreNode(start, visited, null);
        for (const x of model.root.childs) {
          if (!visited.has(x)) {
            exploreNode(x, visited, null);
          }
        }
        this.recalculateProgress(model.root, mw);
      }
    }
  }

  static setProvisionChecked(p: MMELProvision) {
    const mw = functionCollection.getStateMan().state.modelWrapper;
    const addon = mw.clman.getItemAddOn(p);
    addon.isChecked = !addon.isChecked;
    updateProvisionProgress(p);
  }

  static setProvisionProgress(p: MMELProvision, x: number) {
    const mw = functionCollection.getStateMan().state.modelWrapper;
    const addon = mw.clman.getItemAddOn(p);
    addon.progress = x;
    if (x === 100 && !addon.isChecked) {
      addon.isChecked = true;
    }
    if (x < 100 && addon.isChecked) {
      addon.isChecked = false;
    }
  }

  static setAttributeChecked(a: MMELDataAttribute) {
    const mw = functionCollection.getStateMan().state.modelWrapper;
    const addon = mw.clman.getItemAddOn(a);
    addon.isChecked = !addon.isChecked;
  }

  static recalculateProgress(root: MMELSubprocess, modelWrapper: ModelWrapper) {
    const model = modelWrapper.model;
    const visited = new Set<MMELDataClass>();
    const mw = functionCollection.getStateMan().state.modelWrapper;
    for (const d of model.dataclasses) {
      if (!visited.has(d)) {
        visited.add(d);
        evaluateCheckData(d, visited);
      }
    }
    for (const g of model.gateways) {
      if (g.datatype === DataType.EGATE) {
        const gate = g as MMELEGate;
        const addon = mw.clman.getGateAddOn(gate);
        addon.met = null;
      }
    }
    const start = modelWrapper.subman.get(root).start;
    if (start !== null) {
      calNodeProgress(start, new Set<MMELSubprocessComponent>());
    }
  }

  static recalculateEdgeHighlight(page: MMELSubprocess) {
    const mw = functionCollection.getStateMan().state.modelWrapper;
    page.edges.map(e => {
      mw.clman.getEdgeAddOn(e).isDone = false;
    });
    page.childs.map(c => {
      mw.clman.getComAddOn(c).isDone = false;
    });

    const start = mw.subman.get(page).start;
    if (start !== null) {
      setDoneStatus(start, new Set<MMELSubprocessComponent>());
    }

    page.edges.map(e => {
      if (e.from !== null && e.to !== null) {
        mw.clman.getEdgeAddOn(e).isDone =
          mw.clman.getComAddOn(e.to).isDone &&
          mw.clman.getComAddOn(e.from).isDone;
      }
    });
  }
}

export const MyDataCheckBox: React.FC<{
  data: MMELDataClass;
  checkUpdated: () => void;
}> = ({ data, checkUpdated }) => {
  const sm = functionCollection.getStateMan();
  const mw = sm.state.modelWrapper;
  return (
    <MyCheckBox key={data.id + '#CheckBoxContainer'}>
      <input
        type="checkbox"
        key={data.id + '#CheckBox'}
        checked={mw.clman.getItemAddOn(data).isChecked}
        onChange={() => {
          setDataChecked(data);
          checkUpdated();
        }}
      />
    </MyCheckBox>
  );
};

export const MyProcessCheckBox: React.FC<{
  data: MMELProcess | MMELApproval;
  checkUpdated: () => void;
}> = ({ data, checkUpdated }) => {
  const sm = functionCollection.getStateMan();
  const mw = sm.state.modelWrapper;
  const ck =
    data.datatype === DataType.PROCESS
      ? mw.clman.getProcessAddOn(data as MMELProcess).isChecked
      : mw.clman.getApprovalAddOn(data as MMELApproval).isChecked;
  return (
    <MyCheckBox key={data.id + '#CheckBoxContainer'}>
      <input
        type="checkbox"
        key={data.id + '#CheckBox'}
        checked={ck}
        onChange={() => {
          if (data.datatype === DataType.PROCESS) {
            setProcessChecked(data as MMELProcess);
          } else if (data.datatype === DataType.APPROVAL) {
            setApprovalChecked(data as MMELApproval);
          }
          checkUpdated();
        }}
      />
    </MyCheckBox>
  );
};

function setDoneStatus(
  x: MMELSubprocessComponent,
  visited: Set<MMELSubprocessComponent>
) {
  const sm = functionCollection.getStateMan();
  const mw = sm.state.modelWrapper;
  mw.clman.getComAddOn(x).isDone = true;
  visited.add(x);
  for (const c of mw.comman.get(x).child) {
    if (c.to !== null && !visited.has(c.to)) {
      const x = c.to.element;
      if (x?.datatype === DataType.PROCESS) {
        if (mw.clman.getProcessAddOn(x as MMELProcess).percentage === 100) {
          setDoneStatus(c.to, visited);
        }
      } else if (x?.datatype === DataType.APPROVAL) {
        if (mw.clman.getApprovalAddOn(x as MMELApproval).isChecked) {
          setDoneStatus(c.to, visited);
        }
      } else {
        setDoneStatus(c.to, visited);
      }
    }
  }
}

function setDataChecked(d: MMELDataClass) {
  const mw = functionCollection.getStateMan().state.modelWrapper;
  setDataCheckValue(d, !mw.clman.getItemAddOn(d).isChecked);
}

function setProcessChecked(p: MMELProcess) {
  const mw = functionCollection.getStateMan().state.modelWrapper;
  enforceProcess(p, !mw.clman.getProcessAddOn(p).isChecked);
  if (p.page !== null) {
    const start = mw.subman.get(p.page).start;
    if (start !== null) {
      recursiveCheck(
        start,
        mw.clman.getProcessAddOn(p).isChecked,
        new Set<MMELSubprocessComponent>()
      );
    }
  }
}

function setApprovalChecked(a: MMELApproval) {
  const mw = functionCollection.getStateMan().state.modelWrapper;
  const addon = mw.clman.getApprovalAddOn(a);
  addon.isChecked = !addon.isChecked;
}

function setDataCheckValue(d: MMELDataClass, b: boolean) {
  const mw = functionCollection.getStateMan().state.modelWrapper;
  mw.clman.getItemAddOn(d).isChecked = b;
  for (const a of d.attributes) {
    if (a.modality === 'SHALL') {
      mw.clman.getItemAddOn(a).isChecked = b;
    }
  }
  mw.dlman.get(d).rdcs.forEach(r => setDataCheckValue(r, b));
}

function evaluateCheckData(d: MMELDataClass, visited: Set<MMELDataClass>) {
  const mw = functionCollection.getStateMan().state.modelWrapper;
  let ok = true;
  for (const a of d.attributes) {
    if (a.modality === 'SHALL') {
      ok &&= mw.clman.getItemAddOn(a).isChecked;
      if (!ok) {
        break;
      }
    }
  }
  mw.dlman.get(d).rdcs.forEach(x => {
    if (!visited.has(x)) {
      visited.add(x);
      evaluateCheckData(x, visited);
    }
    ok &&= mw.clman.getItemAddOn(x).isChecked;
  });
  mw.clman.getItemAddOn(d).isChecked = ok;
}

function calNodeProgress(
  y: MMELSubprocessComponent,
  visited: Set<MMELSubprocessComponent>
): boolean {
  const mw = functionCollection.getStateMan().state.modelWrapper;
  let result = true;
  visited.add(y);
  const x = y.element;
  if (x?.datatype === DataType.EGATE) {
    result = false;
    for (const c of mw.comman.get(y).child) {
      if (c.to !== null && !visited.has(c.to)) {
        const r = calNodeProgress(c.to, visited);
        result ||= r;
      }
    }
    mw.clman.getGateAddOn(x as MMELEGate).met = result;
  } else {
    for (const c of mw.comman.get(y).child) {
      if (c.to !== null && !visited.has(c.to)) {
        const r = calNodeProgress(c.to, visited);
        result &&= r;
      }
    }
  }
  if (x?.datatype === DataType.PROCESS) {
    const process = x as MMELProcess;
    if (process.page !== null) {
      const start = mw.subman.get(process.page).start;
      if (start !== null) {
        calNodeProgress(start, visited);
      }
    }
    const paddon = mw.clman.getProcessAddOn(process);
    const jobs = paddon.job;
    if (jobs !== null) {
      let sum = 0;
      let count = 0;
      for (const j of jobs) {
        if (j.datatype === DataType.DATACLASS) {
          if (mw.clman.getItemAddOn(j as MMELDataClass).isChecked) {
            sum += 100;
            count++;
          }
        } else if (j.datatype === DataType.PROVISION) {
          const job = j as MMELProvision;
          const addon = mw.clman.getItemAddOn(job);
          sum += addon.progress;
          count += addon.progress === 100 ? 1 : 0;
        } else if (j.datatype === DataType.EGATE) {
          if (mw.clman.getGateAddOn(j as MMELEGate).met) {
            sum += 100;
            count++;
          }
        } else if (j.datatype === DataType.PROCESS) {
          const jp = j as MMELProcess;
          const addon = mw.clman.getProcessAddOn(jp);
          sum += addon.percentage;
          count += addon.percentage === 100 ? 1 : 0;
        }
        if (j.datatype === DataType.APPROVAL) {
          const ja = j as MMELApproval;
          const addon = mw.clman.getApprovalAddOn(ja);
          sum += addon.isChecked ? 100 : 0;
          count += addon.isChecked ? 1 : 0;
        }
      }
      paddon.progress = count;
      if (jobs.length !== 0) {
        paddon.percentage = Math.floor(sum / jobs.length);
      } else {
        paddon.percentage = 100;
      }
      paddon.isChecked = sum === jobs.length * 100;
      result &&= paddon.isChecked;
    }
  }
  return result;
}

function exploreNode(
  y: MMELSubprocessComponent,
  visited: Set<MMELSubprocessComponent>,
  parent: MMELNode | null
): Array<MMELNode | MMELProvision> {
  let ret: Array<MMELNode | MMELProvision> = [];
  const mw = functionCollection.getStateMan().state.modelWrapper;
  if (y.element !== null) {
    const x = y.element;
    visited.add(y);
    if (x.datatype === DataType.PROCESS) {
      const process = x as MMELProcess;
      if (process.modality === 'SHALL') {
        ret.push(x);
      }
      const addon = mw.clman.process.get(process);
      if (addon !== undefined) {
        if (parent !== null) {
          mw.nodeman.get(process).parent.push(parent);
        }
        if (addon.job === null) {
          let jobs: Array<MMELNode | MMELProvision> = [];
          const method = (r: MMELRegistry) => {
            if (r.data !== null) {
              jobs.push(r.data);
              mw.nodeman.get(r.data).parent.push(x);
            }
          };
          process.input.map(method);
          process.output.map(method);
          for (const s of process.provision) {
            if (s.modality === 'SHALL') {
              jobs.push(s);
            }
            mw.nodeman.get(s).parent.push(x);
          }
          if (process.page !== null) {
            const start = mw.subman.get(process.page)?.start;
            if (start !== null) {
              jobs = jobs.concat(
                exploreNode(start, new Set<MMELSubprocessComponent>(), x)
              );
            }
          }
          addon.job = jobs;
        }
      }
    }
    if (x.datatype === DataType.APPROVAL) {
      const app = x as MMELApproval;
      const addon = mw.nodeman.get(app);
      if (parent !== null) {
        addon.parent.push(parent);
      }
      if (app.modality === 'SHALL') {
        ret.push(x);
      }
    }
    if (x.datatype === DataType.EGATE) {
      const gate = x as MMELEGate;
      const addon = mw.clman.getGateAddOn(gate);
      if (parent !== null) {
        mw.nodeman.get(gate).parent.push(parent);
      }
      addon.required = true;
      for (const c of mw.comman.get(y).child) {
        if (c.to !== null) {
          if (
            c.to.element?.datatype === DataType.ENDEVENT ||
            visited.has(c.to)
          ) {
            addon.required = false;
          } else {
            exploreNode(c.to, visited, x);
          }
          if (c.to.element?.datatype === DataType.EGATE) {
            const caddon = mw.clman.getGateAddOn(c.to.element as MMELEGate);
            if (!caddon.required) {
              addon.required = false;
            }
          }
        }
      }
      return addon.required ? [x] : [];
    }
    for (const c of mw.comman.get(y).child) {
      if (c.to !== null && !visited.has(c.to)) {
        ret = ret.concat(exploreNode(c.to, visited, parent));
      }
    }
  }
  return ret;
}

function updateProvisionProgress(p: MMELProvision) {
  const mw = functionCollection.getStateMan().state.modelWrapper;
  const addon = mw.clman.getItemAddOn(p);
  if (addon.isChecked) {
    addon.progress = 100;
  } else {
    addon.progress = 0;
  }
}

function enforceProcess(x: MMELProcess, b: boolean) {
  const mw = functionCollection.getStateMan().state.modelWrapper;
  const addon = mw.clman.getProcessAddOn(x);
  addon.isChecked = b;
  x.provision.map(p => {
    mw.clman.getItemAddOn(p).isChecked = b;
    updateProvisionProgress(p);
  });
  x.input.map(d => (d.data !== null ? setDataCheckValue(d.data, b) : {}));
  x.output.map(d => (d.data !== null ? setDataCheckValue(d.data, b) : {}));
}

function recursiveCheck(
  x: MMELSubprocessComponent,
  b: boolean,
  visited: Set<MMELSubprocessComponent>
) {
  visited.add(x);
  const mw = functionCollection.getStateMan().state.modelWrapper;
  if (x.element !== null && x.element.datatype === DataType.PROCESS) {
    const process = x.element as MMELProcess;
    enforceProcess(process, b);
    if (process.page !== null) {
      const start = mw.subman.get(process.page).start;
      if (start !== null) {
        recursiveCheck(start, b, visited);
      }
    }
  }
  if (x.element?.datatype === DataType.APPROVAL) {
    const addon = mw.clman.getApprovalAddOn(x.element as MMELApproval);
    addon.isChecked = b;
  }
  for (const c of mw.comman.get(x).child) {
    if (c.to !== null && !visited.has(c.to)) {
      recursiveCheck(c.to, b, visited);
    }
  }
}

const MyCheckBox = styled.div`
  position: absolute;
  left: 0px;
  top: 0px;
  width: 30px;
  text-align: left;
  font-size: 12px;
`;

export const ProgressLabel = styled.div`
  position: absolute;
  left: 0px;
  top: -20px;
  width: 140px;
  text-align: right;
  font-size: 12px;
`;

export const PercentageLabel = styled.div`
  position: absolute;
  left: 0px;
  top: -20px;
  width: 140px;
  text-align: left;
  font-size: 12px;
`;
