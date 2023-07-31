import { useReducer } from 'react';
import { MMELProvision } from '@paneron/libmmel/interface/supportinterface';
import { refProvisionReplace } from '@/smart/utils/handler/cascadeModelHandler';
import { UndoReducerInterface } from '@/smart/model/editor/interface';

interface RefCascadeAction {
  subtask: 'process-ref';
  from: string | undefined; // remove from
  to: string | undefined; // add to
  ids: string[];
}

interface ReplaceProvisionsAction {
  task: 'replace';
  from: string[]; // remove from
  to: MMELProvision[]; // add to
}

type CascadeAction = RefCascadeAction & { task: 'cascade' };

type EXPORT_ACTION = ReplaceProvisionsAction | CascadeAction;

export type ProvisionAction = EXPORT_ACTION & { act: 'provision' };

interface InitAction {
  act: 'init';
  value: Record<string, MMELProvision>;
}

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
    case 'replace':
      return provisionReplace(pros, action.from, action.to);
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

export function useProvisions(
  x: Record<string, MMELProvision>
): UndoReducerInterface<Record<string, MMELProvision>, ProvisionAction> {
  const [pros, dispatchElms] = useReducer(reducer, x);

  /**
   * No action should be done directly on provisions
   * No reverse actions here
   */
  function act(action: ProvisionAction): undefined {
    dispatchElms(action);
    return undefined;
  }

  function init(x: Record<string, MMELProvision>) {
    dispatchElms({ act : 'init', value : x });
  }

  return [pros, act, init];
}

function provisionReplace(
  pros: Record<string, MMELProvision>,
  from: string[],
  to: MMELProvision[]
): Record<string, MMELProvision> {
  // Logger.log('Action', pros, from, to);
  for (const f of from) {
    delete pros[f];
  }
  for (const p of to) {
    pros[p.id] = p;
  }
  return pros;
}
