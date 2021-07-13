/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { jsx } from '@emotion/react';
import styled from '@emotion/styled';
import { DataAttribute } from '../../model/model/data/dataattribute';
import { Dataclass } from '../../model/model/data/dataclass';
import { Registry } from '../../model/model/data/registry';
import { EndEvent } from '../../model/model/event/endevent';
import {
  Subprocess,
  SubprocessComponent,
} from '../../model/model/flow/subprocess';
import { EGate } from '../../model/model/gate/egate';
import { GraphNode } from '../../model/model/graphnode';
import { Model } from '../../model/model/model';
import { Approval } from '../../model/model/process/approval';
import { Process } from '../../model/model/process/process';
import { Provision } from '../../model/model/support/provision';
import { ModelWrapper } from '../model/modelwrapper';
import { functionCollection } from './function';

export const initProgressManager = () => {
  console.debug('Recalculate jobs');
  const visited = new Set<SubprocessComponent>();
  const mw = functionCollection.getStateMan().state.modelWrapper;
  const model = mw.model;
  if (model.root != null && model.root.start != null) {
    exploreNode(model.root.start, visited, null);
    for (const x of model.root.childs) {
      if (!visited.has(x)) {
        exploreNode(x, visited, null);
      }
    }
    recalculateProgress(model.root, mw);
  }
};

export const setProvisionChecked = (p: Provision) => {
  p.isChecked = !p.isChecked;
  updateProvisionProgress(p);
};

export const setProvisionProgress = (p: Provision, x: number) => {
  p.progress = x;
  if (x == 100 && !p.isChecked) {
    p.isChecked = true;
  }
  if (x < 100 && p.isChecked) {
    p.isChecked = false;
  }
};

export const setAttributeChecked = (a: DataAttribute) => {
  a.isChecked = !a.isChecked;
};

export const recalculateProgress = (
  root: Subprocess,
  modelWrapper: ModelWrapper
) => {
  const model = modelWrapper.model;
  const visited = new Set<Dataclass>();
  for (const d of model.dcs) {
    if (!visited.has(d)) {
      visited.add(d);
      evaluateCheckData(d, visited);
    }
  }
  for (const g of model.gates) {
    if (g instanceof EGate) {
      g.met = null;
    }
  }
  const start = root.start;
  if (start != null) {
    calNodeProgress(start, new Set<SubprocessComponent>());
  }
};

export const recalculateEdgeHighlight = (page: Subprocess, model: Model) => {
  page.edges.map(e => {
    e.isDone = false;
  });
  page.childs.map(c => {
    c.isDone = false;
  });

  const start = page.start;
  if (start != null) {
    setDoneStatus(start, new Set<SubprocessComponent>());
  }

  page.edges.map(e => {
    if (e.from != null && e.to != null) {
      e.isDone = e.to.isDone && e.from.isDone;
    }
  });
};

function setDoneStatus(
  x: SubprocessComponent,
  visited: Set<SubprocessComponent>
) {
  x.isDone = true;
  visited.add(x);
  for (const c of x.child) {
    if (c.to != null && !visited.has(c.to)) {
      const x = c.to.element;
      if (x instanceof Process) {
        if (x.percentage == 100) {
          setDoneStatus(c.to, visited);
        }
      } else if (x instanceof Approval) {
        if (x.isChecked) {
          setDoneStatus(c.to, visited);
        }
      } else {
        setDoneStatus(c.to, visited);
      }
    }
  }
}

function setDataChecked(d: Dataclass) {
  setDataCheckValue(d, !d.isChecked);
}

function setProcessChecked(p: Process) {
  enforceProcess(p, !p.isChecked);
  if (p.page != null) {
    const start = p.page.start;
    if (start != null) {
      recursiveCheck(start, p.isChecked, new Set<SubprocessComponent>());
    }
  }
}

function setApprovalChecked(a: Approval) {
  a.isChecked = !a.isChecked;
}

function setDataCheckValue(d: Dataclass, b: boolean) {
  d.isChecked = b;
  for (const a of d.attributes) {
    if (a.modality == 'SHALL') {
      a.isChecked = b;
    }
  }
  d.rdcs.forEach(r => setDataCheckValue(r, b));
}

function evaluateCheckData(d: Dataclass, visited: Set<Dataclass>) {
  let ok = true;
  for (const a of d.attributes) {
    if (a.modality == 'SHALL') {
      ok &&= a.isChecked;
      if (!ok) {
        break;
      }
    }
  }
  d.rdcs.forEach(x => {
    if (!visited.has(x)) {
      visited.add(x);
      evaluateCheckData(x, visited);
    }
    ok &&= x.isChecked;
  });
  d.isChecked = ok;
}

function calNodeProgress(
  y: SubprocessComponent,
  visited: Set<SubprocessComponent>
): boolean {
  let result = true;
  visited.add(y);
  const x = y.element;
  if (x instanceof EGate) {
    result = false;
    for (const c of y.child) {
      if (c.to != null && !visited.has(c.to)) {
        const r = calNodeProgress(c.to, visited);
        result ||= r;
      }
    }
    x.met = result;
  } else {
    for (const c of y.child) {
      if (c.to != null && !visited.has(c.to)) {
        const r = calNodeProgress(c.to, visited);
        result &&= r;
      }
    }
  }
  if (x instanceof Process) {
    if (x.page != null && x.page.start != null) {
      calNodeProgress(x.page.start, visited);
    }
    if (x.job != null) {
      let sum = 0;
      let count = 0;
      for (const j of x.job) {
        if (j instanceof Dataclass) {
          if (j.isChecked) {
            sum += 100;
            count++;
          }
        } else if (j instanceof Provision) {
          sum += j.progress;
          count += j.progress == 100 ? 1 : 0;
        } else if (j instanceof EGate) {
          if (j.met) {
            sum += 100;
            count++;
          }
        } else if (j instanceof Process) {
          sum += j.percentage;
          count += j.percentage == 100 ? 1 : 0;
        }
        if (j instanceof Approval) {
          sum += j.isChecked ? 100 : 0;
          count += j.isChecked ? 1 : 0;
        }
      }
      x.progress = count;
      if (x.job.length != 0) {
        x.percentage = Math.floor(sum / x.job.length);
      } else {
        x.percentage = 100;
      }
      x.isChecked = sum == x.job.length * 100;
      result &&= x.isChecked;
    }
  }
  return result;
}

export const MyDataCheckBox: React.FC<{
  data: Dataclass;
  checkUpdated: () => void;
}> = ({ data, checkUpdated }) => {
  return (
    <MyCheckBox key={data.id + '#CheckBoxContainer'}>
      <input
        type="checkbox"
        key={data.id + '#CheckBox'}
        checked={data.isChecked}
        onChange={() => {
          setDataChecked(data);
          checkUpdated();
        }}
      />
    </MyCheckBox>
  );
};

export const MyProcessCheckBox: React.FC<{
  data: Process | Approval;
  checkUpdated: () => void;
}> = ({ data, checkUpdated }) => {
  return (
    <MyCheckBox key={data.id + '#CheckBoxContainer'}>
      <input
        type="checkbox"
        key={data.id + '#CheckBox'}
        checked={data.isChecked}
        onChange={() => {
          if (data instanceof Process) {
            setProcessChecked(data);
          } else if (data instanceof Approval) {
            setApprovalChecked(data);
          }
          checkUpdated();
        }}
      />
    </MyCheckBox>
  );
};

function exploreNode(
  y: SubprocessComponent,
  visited: Set<SubprocessComponent>,
  parent: GraphNode | null
): Array<GraphNode | Provision> {
  let ret: Array<GraphNode | Provision> = [];
  if (y.element != null) {
    const x = y.element;
    visited.add(y);
    if (x instanceof Process) {
      if (x.modality == 'SHALL') {
        ret.push(x);
      }
      if (parent != null) {
        x.parent.push(parent);
      }
      if (x.job == null) {
        let jobs: Array<GraphNode | Provision> = [];
        const method = (r: Registry) => {
          if (r.data != null) {
            jobs.push(r.data);
            r.data.parent.push(x);
          }
        };
        x.input.map(method);
        x.output.map(method);
        for (const s of x.provision) {
          if (s.modality == 'SHALL') {
            jobs.push(s);
          }
          s.parent.push(x);
        }
        if (x.page != null) {
          if (x.page.start != null) {
            jobs = jobs.concat(
              exploreNode(x.page.start, new Set<SubprocessComponent>(), x)
            );
          }
        }
        x.job = jobs;
      }
    }
    if (x instanceof Approval) {
      if (parent != null) {
        x.parent.push(parent);
      }
      if (x.modality == 'SHALL') {
        ret.push(x);
      }
    }
    if (x instanceof EGate) {
      if (parent != null) {
        x.parent.push(parent);
      }
      x.required = true;
      for (const c of y.child) {
        if (c.to != null) {
          if (c instanceof EndEvent || visited.has(c.to)) {
            x.required = false;
          } else {
            exploreNode(c.to, visited, x);
          }
          if (c instanceof EGate) {
            if (!c.required) {
              x.required = false;
            }
          }
        }
      }
      return x.required ? [x] : [];
    }
    for (const c of y.child) {
      if (c.to != null && !visited.has(c.to)) {
        ret = ret.concat(exploreNode(c.to, visited, parent));
      }
    }
  }
  return ret;
}

function updateProvisionProgress(p: Provision) {
  if (p.isChecked) {
    p.progress = 100;
  } else {
    p.progress = 0;
  }
}

function enforceProcess(x: Process, b: boolean) {
  x.isChecked = b;
  x.provision.map(p => {
    p.isChecked = b;
    updateProvisionProgress(p);
  });
  x.input.map(d => (d.data != null ? setDataCheckValue(d.data, b) : {}));
  x.output.map(d => (d.data != null ? setDataCheckValue(d.data, b) : {}));
}

function recursiveCheck(
  x: SubprocessComponent,
  b: boolean,
  visited: Set<SubprocessComponent>
) {
  visited.add(x);
  if (x.element != null && x.element instanceof Process) {
    enforceProcess(x.element, b);
    if (x.element.page != null) {
      const start = x.element.page.start;
      if (start != null) {
        recursiveCheck(start, b, visited);
      }
    }
  }
  if (x.element instanceof Approval) {
    x.element.isChecked = b;
  }
  for (const c of x.child) {
    if (c.to != null && !visited.has(c.to)) {
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
