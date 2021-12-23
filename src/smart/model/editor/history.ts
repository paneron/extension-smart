import { useReducer } from "react";
import { HistoryItem } from "../history";
import { UndoReducerInterface } from "./interface";

type PushAction = {
  act: 'push';
  value: HistoryItem;
}

type PopAction = {
  act: 'pop';
}

type InitAction = {
  act: 'init';
  value: HistoryItem[];
}

export type HistoryAction = (PushAction | PopAction) & {type: 'history'};

type OwnAction = HistoryAction | InitAction;

function reducer(list: HistoryItem[], action: OwnAction) {
  switch (action.act) {
    case 'push': return [...list, action.value];
    case 'pop': return list.length > 1 ? list.slice(0, -1) : list;
    case 'init': return [...action.value];
  }
}

function findReverse(his: HistoryItem[], action: HistoryAction):HistoryAction|undefined {
  if (action.act === 'push') {
    return {act: 'pop', type: 'history'};
  } else {
    if (his.length > 1) {
      return {act: 'push', value: his[his.length-1], type: 'history'}
    }
    return undefined;
  }  
}

export function useHistory(x: HistoryItem[]):UndoReducerInterface<HistoryItem[], HistoryAction> {
  const [his, dispatchHis] = useReducer(reducer, x);  

  function act(action: HistoryAction): HistoryAction|undefined {    
    dispatchHis(action);
    return findReverse(his, action);
  }

  function init(x: HistoryItem[]) {
    dispatchHis({act: 'init', value: x});
  }

  return [his, act, init];
}