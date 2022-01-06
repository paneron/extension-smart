import { useReducer } from 'react';
import { MMELProvision } from '../../../serialize/interface/supportinterface';
import { refProvisionReplace } from '../../../utils/handler/cascadeModelHandler';
import { UndoReducerInterface } from '../interface';

type RefCascadeAction = {
  subtask: 'process-ref';
  from: string | undefined; // remove from
  to: string | undefined; // add to
  ids: string[];
};

type CascadeAction = RefCascadeAction & { task: 'cascade' };

type EXPORT_ACTION = CascadeAction;

export type ProvisionAction = EXPORT_ACTION & { act: 'provision' };

type InitAction = {
  act: 'init';
  value: Record<string, MMELProvision>;
};

type OwnAction = ProvisionAction | InitAction;

function cascadeReducer(
  pros: Record<string, MMELProvision>,
  action: CascadeAction
): Record<string, MMELProvision> {
  switch (action.subtask) {
    case 'process-ref':
      return refProvisionReplace(pros, action.ids, action.from, action.to);
  }
}

function proReducer(
  pros: Record<string, MMELProvision>,
  action: ProvisionAction
): Record<string, MMELProvision> {
  switch (action.task) {
    case 'cascade':
      return cascadeReducer(pros, action);
  }
}

function reducer(
  pros: Record<string, MMELProvision>,
  action: OwnAction
): Record<string, MMELProvision> {
  switch (action.act) {
    case 'init':
      return { ...action.value };
    case 'provision':
      return proReducer({ ...pros }, action);
  }
}

function findReverse(
  pros: Record<string, MMELProvision>,
  action: ProvisionAction
): ProvisionAction | undefined {
  switch (action.task) {
    case 'cascade':
      return undefined;
  }
}

export function useProvisions(
  x: Record<string, MMELProvision>
): UndoReducerInterface<Record<string, MMELProvision>, ProvisionAction> {
  const [pros, dispatchElms] = useReducer(reducer, x);

  function act(action: ProvisionAction): ProvisionAction | undefined {
    dispatchElms(action);
    return findReverse(pros, action);
  }

  function init(x: Record<string, MMELProvision>) {
    dispatchElms({ act: 'init', value: x });
  }

  return [pros, act, init];
}
