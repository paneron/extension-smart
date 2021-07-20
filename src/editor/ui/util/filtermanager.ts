import { DataType } from '../../serialize/interface/baseinterface';
import { MMELDataClass } from '../../serialize/interface/datainterface';
import {
  MMELSubprocess,
  MMELSubprocessComponent,
} from '../../serialize/interface/flowcontrolinterface';
import {
  MMELApproval,
  MMELProcess,
} from '../../serialize/interface/processinterface';
import { MMELProvision } from '../../serialize/interface/supportinterface';
import { ISearch } from '../interface/state';
import { ModelWrapper } from '../model/modelwrapper';
import { functionCollection } from './function';

export function calculateFilter(mw: ModelWrapper, cond: ISearch): void {
  const model = mw.model;
  const require: boolean = cond.document !== '' || cond.actor !== '';
  for (const p of model.processes) {
    mw.filterman.get(p).filterMatch = require
      ? FilterType.UNKNOWN
      : FilterType.NOT_MATCH;
  }
  for (const p of model.approvals) {
    mw.filterman.get(p).filterMatch = require
      ? FilterType.UNKNOWN
      : FilterType.NOT_MATCH;
  }
  for (const d of model.dataclasses) {
    mw.filterman.get(d).filterMatch =
      cond.document !== '' ? checkData(d, cond) : FilterType.NOT_MATCH;
  }
  if (mw.model.root !== null && require) {
    explore(mw.model.root, new Set<MMELSubprocessComponent>(), cond);
  }
}

function checkData(d: MMELDataClass, cond: ISearch): FilterType {
  for (const a of d.attributes) {
    for (const r of a.ref) {
      if (
        cond.document === r.document &&
        (cond.clause === '' || cond.clause === r.clause)
      ) {
        return FilterType.EXACT_MATCH;
      }
    }
  }
  return FilterType.NOT_MATCH;
}

function explore(
  x: MMELSubprocess,
  visited: Set<MMELSubprocessComponent>,
  cond: ISearch
): boolean {
  let result = false;
  x.childs.forEach(c => {
    if (!visited.has(c)) {
      visited.add(c);
      if (c.element?.datatype === DataType.PROCESS) {
        if (checkProcess(c.element as MMELProcess, cond, visited)) {
          result = true;
        }
      } else if (c.element?.datatype === DataType.APPROVAL) {
        if (checkApproval(c.element as MMELApproval, cond)) {
          result = true;
        }
      }
    } else if (c.element?.datatype === DataType.PROCESS) {
      const process = c.element as MMELProcess;
      const addon = functionCollection
        .getStateMan()
        .state.modelWrapper.filterman.get(process);
      if (addon.filterMatch === FilterType.UNKNOWN) {
        console.error('Filter match result is not computed before access?', x);
      }
      if (
        addon.filterMatch === FilterType.EXACT_MATCH ||
        addon.filterMatch === FilterType.SUBPROCESS_MATCH
      ) {
        result = true;
      }
    }
  });
  return result;
}

function checkProcess(
  p: MMELProcess,
  cond: ISearch,
  visited: Set<MMELSubprocessComponent>
): boolean {
  let result = false;
  const addon = functionCollection
    .getStateMan()
    .state.modelWrapper.filterman.get(p);
  if (p.page !== null) {
    if (explore(p.page, visited, cond)) {
      addon.filterMatch = FilterType.SUBPROCESS_MATCH;
      result = true;
    }
  }
  if (cond.actor === '' || (p.actor !== null && p.actor.name === cond.actor)) {
    if (cond.document !== '') {
      p.provision.map(x => {
        if (checkProvision(x, cond)) {
          addon.filterMatch = FilterType.EXACT_MATCH;
          result = true;
        }
      });
    } else {
      addon.filterMatch = FilterType.EXACT_MATCH;
      result = true;
    }
  }
  if (!result) {
    addon.filterMatch = FilterType.NOT_MATCH;
  }
  return result;
}

function checkProvision(p: MMELProvision, cond: ISearch): boolean {
  for (const r of p.ref) {
    if (
      cond.document === r.document &&
      (cond.clause === '' || cond.clause === r.clause)
    ) {
      return true;
    }
  }
  return false;
}

function checkApproval(p: MMELApproval, cond: ISearch): boolean {
  if (
    cond.actor === '' ||
    (p.actor !== null && p.actor.name === cond.actor) ||
    (p.approver !== null && p.approver.name === cond.actor)
  ) {
    for (const r of p.ref) {
      if (
        cond.document === r.document &&
        (cond.clause === '' || cond.clause === r.clause)
      ) {
        functionCollection
          .getStateMan()
          .state.modelWrapper.filterman.get(p).filterMatch =
          FilterType.EXACT_MATCH;
        return true;
      }
    }
  }
  return false;
}

export enum FilterType {
  UNKNOWN,
  NOT_MATCH,
  EXACT_MATCH,
  SUBPROCESS_MATCH,
}
