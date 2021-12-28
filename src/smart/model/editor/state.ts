import { useReducer } from 'react';
import { EditorState } from '../States';
import { HistoryAction, useHistory } from './history';
import { UndoManagerInterface } from './interface';
import { ModelAction, useModel } from './model';

export type EditorAction = ModelAction | HistoryAction;

export type UndoListAction = {
  act: 'push' | 'pop' | 'new';
  value?: EditorAction;
};

function listReducer(list: EditorAction[], action: UndoListAction) {
  const { act, value } = action;
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

export function useEditorState(
  x: EditorState
): UndoManagerInterface<EditorState, EditorAction> {
  const [model, actModel] = useModel(x.model);
  const [history, actHistory] = useHistory(x.history);
  const [undoHis, actUndoHis] = useReducer(listReducer, []);
  const [redoHis, actRedoHis] = useReducer(listReducer, []);

  const page = history[history.length - 1].page;

  const state: EditorState = { history, page, model, type: 'model' };

  function act(action: EditorAction) {
    switch (action.type) {
      case 'model':
        modelAction(action);
        break;
      case 'history':
        historyAction(action);
        break;
    }
  }

  function undo() {
    const len = undoHis.length;
    if (len > 0) {
      const action = undoHis[len - 1];
      const reverse = hisAction(action);
      actRedoHis({ act: 'push', value: reverse });
      actUndoHis({ act: 'pop' });
    }
  }

  function redo() {
    const len = redoHis.length;
    if (len > 0) {
      const action = redoHis[len - 1];
      const reverse = hisAction(action);
      actUndoHis({ act: 'push', value: reverse });
      actRedoHis({ act: 'pop' });
    }
  }

  function hisAction(action: EditorAction): EditorAction | undefined {
    switch (action.type) {
      case 'model':
        return actModel(action);
      case 'history':
        return actHistory(action);
    }
  }

  function modelAction(action: ModelAction) {
    const reverse = actModel(action);
    const len = undoHis.length;
    const his = undoHis[len - 1];
    // combine undo history if it is editing on the same id and same property
    if (
      reverse &&
      (len === 0 || redo.length > 0 || !actionCombinable(his, action))
    ) {
      actUndoHis({ act: 'push', value: reverse });
      actRedoHis({ act: 'new' });
    }
  }

  function historyAction(action: HistoryAction) {
    const reverse = actHistory(action);
    if (reverse) {
      actUndoHis({ act: 'push', value: reverse });
      actRedoHis({ act: 'new' });
    }
  }

  return [
    state,
    act,
    undoHis.length > 0 ? undo : undefined,
    redoHis.length > 0 ? redo : undefined,
  ];
}

function actionCombinable(before: EditorAction, after: EditorAction): boolean {
  if (before.act === 'meta' && after.act === 'meta') {
    return before.property === after.property;
  } else if (before.act === 'section' && after.act === 'section') {
    return (
      before.task === 'edit' &&
      after.task === 'edit' &&
      before.value.id === after.id
    );
  } else if (before.act === 'terms' && after.act === 'terms') {
    return (
      before.task === 'edit' &&
      after.task === 'edit' &&
      before.value.id === after.id
    );
  } else if (before.act === 'roles' && after.act === 'roles') {
    return (
      before.task === 'edit' &&
      after.task === 'edit' &&
      before.value.id === after.id
    );
  }
  return false;
}
