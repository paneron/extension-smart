import { useReducer, useState } from 'react';
import * as Logger from '@/lib/logger';
import type { ChangeLog } from '@/smart/model/changelog';
import { addToLog } from '@/smart/model/changelog';
import type { EditorState } from '@/smart/model/States';
import type { HistoryAction } from '@/smart/model/editor/history';
import { useHistory } from '@/smart/model/editor/history';
import type { UndoManagerInterface } from '@/smart/model/editor/interface';
import type { ModelAction } from '@/smart/model/editor/model';
import { useModel } from '@/smart/model/editor/model';

export type EditorAction = ModelAction | HistoryAction;

export interface UndoListAction {
  act: 'push' | 'pop' | 'new' | 'post';
  value?: EditorAction;
}

function listReducer(list: EditorAction[], action: UndoListAction) {
  const { act, value } = action;
  if (act === 'push') {
    if (value) {
      list = [...list, value];
    }
    return list;
  } else if (act === 'new') {
    return value ? [value] : [];
  } else if (act === 'pop') {
    return list.length === 0 ? [] : list.slice(0, -1);
  } else {
    // Logger.log('Edit undo history', list, list.length);
    const last = list[list.length - 1];
    if (
      last &&
      last.type === 'model' &&
      value &&
      value.type === 'model' &&
      value.act === 'validate-page'
    ) {
      // Logger.log('Reverse actions', value);
      // Logger.log('Append to', last);
      if (last.act === 'elements' || last.act === 'pages') {
        // Logger.log('Actual actions', value.cascade);
        const cascade = value.cascade;
        if (last.cascade && cascade) {
          for (const c of cascade) {
            last.cascade.push(c);
          }
          // Logger.log('Appended', last);
        }
      } else if (last.act === 'hybird') {
        const cascade = value.cascade;
        if (last.actions && cascade) {
          for (const c of cascade) {
            last.actions.push(c);
          }
          // Logger.log('Appended', last);
        }
      }
    }
    return list;
  }
}

export function useEditorState(
  x: EditorState
): UndoManagerInterface<EditorState, EditorAction> {
  const [model, actModel] = useModel(x.model);
  const [history, actHistory] = useHistory(x.history);
  const [undoHis, actUndoHis] = useReducer(listReducer, []);
  const [redoHis, actRedoHis] = useReducer(listReducer, []);
  const [post, setPost] = useState<ModelAction | undefined>(undefined);

  const page = history[history.length - 1].page;
  const state: EditorState = { history, page, model, type : 'model' };

  // Logger.log('Page', Object.values(model.pages[page].childs).map(x => x.element));
  // Logger.log('Edges', Object.values(model.pages[page].edges).map(x => `${x.from}-${x.to}`));
  // Logger.log('Elements', Object.values(model.elements).map(x => x.id));

  if (post) {
    // Logger.log('Post processing');
    const reverse = actModel(post, page);
    // Logger.log('Reverse:', reverse);
    actUndoHis({ act : 'post', value : reverse });
    setPost(undefined);
  }

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

  function undo(log: ChangeLog, user: string) {
    const len = undoHis.length;
    if (len > 0) {
      const action = undoHis[len - 1];
      const reverse = hisAction(action, log, user);
      actRedoHis({ act : 'push', value : reverse });
      actUndoHis({ act : 'pop' });
    }
  }

  function redo(log: ChangeLog, user: string) {
    try {
      const len = redoHis.length;
      if (len > 0) {
        const action = redoHis[len - 1];
        const reverse = hisAction(action, log, user);
        actUndoHis({ act : 'push', value : reverse });
        actRedoHis({ act : 'pop' });
        if (action.type === 'model') {
          const post: ModelAction = {
            type      : 'model',
            act       : 'validate-page',
            page,
            refAction : action,
          };
          setPost(post);
        }
      }
    } catch (e: unknown) {
      if (typeof e === 'object') {
        const error = e as Error;
        Logger.log(error.message);
        Logger.log(error.stack);
      }
    }
  }

  function clearRedo() {
    actRedoHis({ act : 'new' });
  }

  function hisAction(
    action: EditorAction,
    log: ChangeLog,
    user: string
  ): EditorAction | undefined {
    switch (action.type) {
      case 'model': {
        addToLog(log, user, action);
        const reverse = actModel(action, page);
        return reverse;
      }
      case 'history': {
        return actHistory(action);
      }
    }
  }

  function modelAction(action: ModelAction) {
    const reverse = actModel(action, page);
    const len = undoHis.length;
    const his = undoHis[len - 1];
    if (needCheck(action)) {
      const post: ModelAction = {
        type      : 'model',
        act       : 'validate-page',
        page,
        refAction : action,
      };
      setPost(post);
    }
    // combine undo history if it is editing on the same id and same property
    if (
      reverse &&
      (len === 0 || redo.length > 0 || !actionCombinable(his, action))
    ) {
      actUndoHis({ act : 'push', value : reverse });
      actRedoHis({ act : 'new' });
    }
  }

  function historyAction(action: HistoryAction) {
    const reverse = actHistory(action);
    if (reverse) {
      actUndoHis({ act : 'push', value : reverse });
      actRedoHis({ act : 'new' });
    }
  }

  return [
    state,
    act,
    undoHis.length > 0 ? undo : undefined,
    redoHis.length > 0 ? redo : undefined,
    clearRedo,
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

function needCheck(action: ModelAction): boolean {
  switch (action.act) {
    case 'comment':
      return false;
    case 'elements':
      return true;
    case 'enums':
      return false;
    case 'figure':
      return false;
    case 'meta':
      return false;
    case 'pages':
      return action.task !== 'move';
    case 'provision':
      return false;
    case 'refs':
      return false;
    case 'roles':
      return false;
    case 'section':
      return false;
    case 'table':
      return false;
    case 'terms':
      return false;
    case 'vars':
      return false;
    case 'view':
      return false;
    case 'hybird':
      return (
        action.task === 'process-delete' ||
        action.task === 'process-bringin' ||
        action.task === 'process-edit' ||
        action.task === 'registry-import-ref' ||
        action.task === 'dc-import-ref' ||
        action.task === 'elm-import'
      );
    default:
      throw new Error('Checking for post actions not handled');
  }
}
