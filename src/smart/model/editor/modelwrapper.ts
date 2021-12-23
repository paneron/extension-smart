import { useReducer, useState } from "react";
import { ModelWrapper } from "../modelwrapper";
import { EditorState } from "../States";
import { HistoryAction, useHistory } from "./history";
import { UndoManagerInterface } from "./interface"
import { ModelAction, useModel } from "./model";

export type MWAction = ModelAction | HistoryAction;

export type UndoListAction = {
  act: 'push' | 'pop' | 'new';
  value?: MWAction;
}

function listReducer(list: MWAction[], action: UndoListAction) {
  const {act, value} = action;
  if (act === 'push') {
    if (value) {
      list = [...list, value];
    }
    return list;
  } else if (act === 'new') {
    return value ? [value] : [];
  } else {
    return list.length === 0 ? [] : list.slice(0, -1);
  }
}

export function useEditorState(x: EditorState):UndoManagerInterface<EditorState, MWAction> {  
  const [page, setPage] = useState<string>(x.modelWrapper.page);
  const [model, actModel, initModel] = useModel(x.modelWrapper.model);  
  const [undoHis, actUndoHis] = useReducer(listReducer, []);
  const [redoHis, actRedoHis] = useReducer(listReducer, []);
  const [history, actHistory] = useHistory(x.history.items);
  
  const mw:ModelWrapper = {page, model, type: 'modelwrapper'};
  const state: EditorState = {history: {items: history}, modelWrapper:mw};
  
  function act(action: MWAction) {
    switch (action.type) {
      case 'model': modelAction(action); break;
      case 'history': historyAction(action); break;
        
    }    
  }

  function undo() {
    const len = undoHis.length;
    if (len > 0) {
      const action = undoHis[len - 1];
      const reverse = hisAction(action);
      actRedoHis({act: 'push', value: reverse});
      actUndoHis({act: 'pop'});
    }        
  }

  function redo() {    
    const len = redoHis.length;
    if (len > 0) {
      const action = redoHis[len - 1];
      const reverse = hisAction(action);
      actUndoHis({act: 'push', value: reverse});
      actRedoHis({act: 'pop'});
    }
  }

  function init(x: EditorState) {    
    const mw = x.modelWrapper;
    setPage(mw.page);
    initModel(mw.model);    
  }

  function hisAction(action: MWAction):MWAction|undefined {
    switch (action.type) {
      case 'model': return actModel(action);
      case 'history': return actHistory(action);
    }
  }

  function modelAction(action: ModelAction) {
    const reverse = actModel(action);
    const len = undoHis.length;
    const his = undoHis[len - 1];
    if (len === 0 || redo.length > 0 || his.act !== action.act || his.property !== action.property) {                        
      actUndoHis({act: 'push', value: reverse});
      actRedoHis({act: 'new'});
    }
  }

  function historyAction(action: HistoryAction) {
    const reverse = actHistory(action);
    actUndoHis({act: 'push', value: reverse});
    actRedoHis({act: 'new'});    
  }

  return [state, act, undoHis.length > 0 ? undo:undefined, redoHis.length > 0 ? redo: undefined, init];
}