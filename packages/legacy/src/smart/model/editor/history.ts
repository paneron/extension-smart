/**
 * This file contains the commands and handling of history related tasks
 */

import { useReducer } from 'react';
import { HistoryItem } from '../history';
import { UndoReducerInterface } from './interface';

/**
 * Drill down more levels
 */
export interface PushAction {
  act: 'push';
  value: HistoryItem[];
}

/**
 * Drill up some levels. Number of levels is defined by the 'value' propery
 */
export interface PopAction {
  act: 'pop';
  value: number;
}

/**
 * Replace the current page history by the given one
 */
export interface ReplaceAction {
  act: 'replace';
  value: HistoryItem[];
}

/**
 * Initialize the page history
 */
interface InitAction {
  act: 'init';
  value: HistoryItem[];
}

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

/**
 * Find the corresponding undo action of the current action
 * @param his The current history
 * @param action The given action
 * @returns The undo action
 */
function findReverse(
  his: HistoryItem[],
  action: HistoryAction
): HistoryAction | undefined {
  switch (action.act) {
    case 'push':
      return { act : 'pop', type : 'history', value : action.value.length };
    case 'pop': {
      if (his.length > action.value) {
        return {
          act   : 'push',
          value : his.slice(his.length - action.value),
          type  : 'history',
        };
      }
      break;
    }
    case 'replace': {
      return { act : 'replace', value : his, type : 'history' };
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
    dispatchHis({ act : 'init', value : x });
  }

  return [his, act, init];
}
