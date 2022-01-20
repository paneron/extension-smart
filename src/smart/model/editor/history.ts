import { useReducer } from 'react';
import { HistoryItem } from '../history';
import { UndoReducerInterface } from './interface';

type PushAction = {
  act: 'push';
  value: HistoryItem[];
};

type PopAction = {
  act: 'pop';
  value: number;
};

type ReplaceAction = {
  act: 'replace';
  value: HistoryItem[];
};

type InitAction = {
  act: 'init';
  value: HistoryItem[];
};

export type HistoryAction = (PushAction | PopAction | ReplaceAction) & {
  type: 'history';
};

type OwnAction = HistoryAction | InitAction;

function reducer(list: HistoryItem[], action: OwnAction) {
  switch (action.act) {
    case 'push':
      return [...list, ...action.value];
    case 'pop':
      return action.value > 0 && list.length > action.value
        ? list.slice(0, -action.value)
        : list;
    case 'replace':
      return [...action.value];
    case 'init':
      return [...action.value];
  }
}

function findReverse(
  his: HistoryItem[],
  action: HistoryAction
): HistoryAction | undefined {
  switch (action.act) {
    case 'push':
      return { act: 'pop', type: 'history', value: action.value.length };
    case 'pop': {
      if (his.length > action.value) {
        return {
          act: 'push',
          value: his.slice(his.length - action.value),
          type: 'history',
        };
      }
      break;
    }
    case 'replace': {
      return { act: 'replace', value: his, type: 'history' };
    }
  }
  return undefined;
}

export function useHistory(
  x: HistoryItem[]
): UndoReducerInterface<HistoryItem[], HistoryAction> {
  const [his, dispatchHis] = useReducer(reducer, x);

  function act(action: HistoryAction): HistoryAction | undefined {
    dispatchHis(action);
    return findReverse(his, action);
  }

  function init(x: HistoryItem[]) {
    dispatchHis({ act: 'init', value: x });
  }

  return [his, act, init];
}
