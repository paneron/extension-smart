import { useReducer } from 'react';
import { MMELLink } from '../../../serialize/interface/supportinterface';
import { UndoReducerInterface } from '../interface';

type RefCascadeAction = {
  subtask: 'process-ref';
  from: string | undefined; // remove from
  to: string | undefined; // add to
  ids: string[];
};

type ReplaceLinksAction = {
  task: 'replace';
  from: string[]; // remove from
  to: MMELLink[]; // add to
};

type CascadeAction = RefCascadeAction & { task: 'cascade' };

type EXPORT_ACTION = CascadeAction | ReplaceLinksAction;

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
    case 'replace':
      return linksReplace(links, action.from, action.to);
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

export function useLinks(
  x: Record<string, MMELLink>
): UndoReducerInterface<Record<string, MMELLink>, LinkAction> {
  const [links, dispatchElms] = useReducer(reducer, x);

  function act(action: LinkAction): undefined {
    dispatchElms(action);
    return undefined;
  }

  function init(x: Record<string, MMELLink>) {
    dispatchElms({ act: 'init', value: x });
  }

  return [links, act, init];
}

function linksReplace(
  links: Record<string, MMELLink>,
  from: string[],
  to: MMELLink[]
): Record<string, MMELLink> {
  for (const f of from) {
    delete links[f];
  }
  for (const p of to) {
    links[p.id] = p;
  }
  return links;
}
