import { useReducer } from 'react';
import { MMELLink } from '../../../serialize/interface/supportinterface';
import { UndoReducerInterface } from '../interface';

type RefCascadeAction = {
  subtask: 'process-ref';
  from: string | undefined; // remove from
  to: string | undefined; // add to
  ids: string[];
};

type CascadeAction = RefCascadeAction & { task: 'cascade' };

type EXPORT_ACTION = CascadeAction;

export type LinkAction = EXPORT_ACTION & { act: 'link' };

type InitAction = {
  act: 'init';
  value: Record<string, MMELLink>;
};

type OwnAction = LinkAction | InitAction;

function cascadeReducer(
  links: Record<string, MMELLink>,
  action: CascadeAction
): Record<string, MMELLink> {
  switch (action.subtask) {
    case 'process-ref':
      return links;
  }
}

function proReducer(
  links: Record<string, MMELLink>,
  action: LinkAction
): Record<string, MMELLink> {
  switch (action.task) {
    case 'cascade':
      return cascadeReducer(links, action);
  }
}

function reducer(
  links: Record<string, MMELLink>,
  action: OwnAction
): Record<string, MMELLink> {
  switch (action.act) {
    case 'init':
      return { ...action.value };
    case 'link':
      return proReducer({ ...links }, action);
  }
}

function findReverse(
  links: Record<string, MMELLink>,
  action: LinkAction
): LinkAction | undefined {
  switch (action.task) {
    case 'cascade':
      return undefined;
  }
}

export function useLinks(
  x: Record<string, MMELLink>
): UndoReducerInterface<Record<string, MMELLink>, LinkAction> {
  const [links, dispatchElms] = useReducer(reducer, x);

  function act(action: LinkAction): LinkAction | undefined {
    dispatchElms(action);
    return findReverse(links, action);
  }

  function init(x: Record<string, MMELLink>) {
    dispatchElms({ act: 'init', value: x });
  }

  return [links, act, init];
}
