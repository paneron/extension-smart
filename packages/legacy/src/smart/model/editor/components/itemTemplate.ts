import { useReducer } from 'react';
import { UndoReducerInterface } from '../interface';

export interface EditAction<T> {
  task: 'edit';
  id: string;
  value: T;
}

export interface AddAction<T> {
  task: 'add';
  value: T[];
}

export interface DeleteAction {
  task: 'delete';
  value: string[];
}

interface CoreComponent {
  id: string;
}

type EXPORT_ACTION<T> = EditAction<T> | AddAction<T> | DeleteAction;
export type ItemAction<T, L extends string> = EXPORT_ACTION<T> & {
  act: L;
};

interface InitAction<T> {
  task: 'init';
  value: Record<string, T>;
}

type OwnAction<T> = EditAction<T> | AddAction<T> | InitAction<T> | DeleteAction;

export function useItems<T extends CoreComponent, L extends string>(
  x: Record<string, T>,
  type: L
): UndoReducerInterface<Record<string, T>, ItemAction<T, L>> {
  const [items, dispatchSec] = useReducer(reducer, x);

  function act(action: ItemAction<T, L>): ItemAction<T, L> | undefined {
    dispatchSec(action);
    return findReverse(items, action, type);
  }

  function init(x: Record<string, T>) {
    dispatchSec({ task : 'init', value : x });
  }

  return [items, act, init];

  function reducer(
    secs: Record<string, T>,
    action: OwnAction<T>
  ): Record<string, T> {
    switch (action.task) {
      case 'init': {
        const newSecs = { ...action.value };
        return newSecs;
      }
      case 'add': {
        return addItem({ ...secs }, action.value);
      }
      case 'delete': {
        return delItem({ ...secs }, action.value);
      }
      case 'edit': {
        return editItem({ ...secs }, action.id, action.value);
      }
    }
  }
}
function findReverse<T extends CoreComponent, L extends string>(
  items: Record<string, T>,
  action: ItemAction<T, L>,
  type: L
): ItemAction<T, L> | undefined {
  switch (action.task) {
    case 'add': {
      return {
        act   : type,
        task  : 'delete',
        value : action.value.map(x => x.id),
      };
    }
    case 'delete': {
      return {
        act   : type,
        task  : 'add',
        value : action.value.map(x => items[x]),
      };
    }
    case 'edit': {
      return {
        act   : type,
        task  : 'edit',
        id    : action.value.id,
        value : items[action.id],
      };
    }
  }
}

function delItem<T>(items: Record<string, T>, ids: string[]) {
  for (const id of ids) {
    delete items[id];
  }
  return items;
}

function addItem<T extends CoreComponent>(
  items: Record<string, T>,
  values: T[]
) {
  for (const v of values) {
    items[v.id] = v;
  }
  return items;
}

function editItem<T extends CoreComponent>(
  items: Record<string, T>,
  id: string,
  value: T
) {
  delete items[id];
  items[value.id] = value;
  return items;
}
