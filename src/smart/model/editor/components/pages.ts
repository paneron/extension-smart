import { useReducer } from 'react';
import { dataPageReplace, elmPageReplace } from '../../../utils/handler/cascadeModelHandler';
import { Logger } from '../../../utils/ModelFunctions';
import { EditorNode, EditorSubprocess } from '../../editormodel';
import { UndoReducerInterface } from '../interface';
import { ModelAction } from '../model';

type RegCascadeAction = {
  subtask: 'data';
  from: string | undefined; // remove from
  to: string | undefined; // add to
  ids: [string, number, number][];
};

type ElmCascadeAction = {
  subtask: 'element';
  from: string | undefined; // remove from
  to: string | undefined; // add to
  ids: [string, number, number][];
};

type CascadeAction = (RegCascadeAction | ElmCascadeAction) & {
  task: 'cascade';
};

type NewElementAction = {
  task: 'new-element';
  value: EditorNode;
  page: string;
  x: number;
  y: number;  
}

type DeleteElementAction = {
  task: 'delete-element';
  value: EditorNode;
  page: string;    
}

type EXPORT_ACTION = CascadeAction | NewElementAction | DeleteElementAction;

export type PageAction = EXPORT_ACTION & { 
  act: 'pages' 
  cascade?: ModelAction[];
};

type InitAction = {
  act: 'init';
  value: Record<string, EditorSubprocess>;
};

type OwnAction = PageAction | InitAction;

function cascadeReducer(
  pages: Record<string, EditorSubprocess>,
  action: CascadeAction
): Record<string, EditorSubprocess> {
  switch (action.subtask) {
    case 'data':
      return dataPageReplace(pages, action.ids, action.from, action.to);
      case 'element':
        return elmPageReplace(pages, action.ids, action.from, action.to);
  }
}

function pageReducer(
  pages: Record<string, EditorSubprocess>,
  action: PageAction
): Record<string, EditorSubprocess> {
  switch (action.task) {
    case 'cascade':
      return cascadeReducer(pages, action);
    case 'new-element': {
      return elmPageReplace(pages, [[action.page, action.x, action.y]], undefined, action.value.id);
    }      
    case 'delete-element': {
      return elmPageReplace(pages, [[action.page, 0, 0]], action.value.id, undefined);
    }      
  }
}

function reducer(
  pages: Record<string, EditorSubprocess>,
  action: OwnAction
): Record<string, EditorSubprocess> {
  try {
    switch (action.act) {
      case 'init':
        return { ...action.value };
      case 'pages':
        return pageReducer({...pages}, action);
    }
  } catch (e: unknown) {
    if (typeof e === 'object') {
      const error = e as Error;
      Logger.log(error.message);
      Logger.log(error.stack);
    }
  }
  return pages;
}

function findReverse(
  pages: Record<string, EditorSubprocess>,
  action: PageAction
): PageAction | undefined {
  switch (action.task) {
    case 'cascade':
      return undefined;
      case 'new-element':
        return {
          act: 'pages',
          task: 'delete-element',
          page: action.page,
          value: action.value
        }
      case 'delete-element': {
        const compo = pages[action.page].childs[action.value.id];
        return {
          act: 'pages',
          task: 'new-element',
          page: action.page,
          value: action.value,
          x: compo.x,
          y: compo.y
        }
      }
  }
}

export function usePages(
  x: Record<string, EditorSubprocess>
): UndoReducerInterface<Record<string, EditorSubprocess>, PageAction> {
  const [elms, dispatchElms] = useReducer(reducer, x);

  function act(action: PageAction): PageAction | undefined {
    dispatchElms(action);
    return findReverse(elms, action);
  }

  function init(x: Record<string, EditorSubprocess>) {
    dispatchElms({ act: 'init', value: x });
  }

  return [elms, act, init];
}

export function cascadeCheckPages(
  action: PageAction
): ModelAction[] | undefined {
  if (action.cascade) {
    return undefined;
  }  
  if (action.task === 'new-element') {
    action.cascade = [{
      type: 'model',
      act: 'elements',
      task: 'add',
      subtask: 'flowunit',
      value: [action.value]
    }];
    return [{
      type: 'model',
      act: 'elements',
      task: 'delete',
      subtask: 'flowunit',
      value: [action.value.id]
    }
    ];
  }
  return [];
}