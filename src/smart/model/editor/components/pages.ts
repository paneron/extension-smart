import { useReducer } from 'react';
import { dataPageReplace } from '../../../utils/handler/cascadeModelHandler';
import { Logger } from '../../../utils/ModelFunctions';
import { EditorSubprocess } from '../../editormodel';
import { UndoReducerInterface } from '../interface';

type RegCascadeAction = {
  subtask: 'data';
  from: string | undefined; // remove from
  to: string | undefined; // add to
  ids: [string, number, number][];
};

type CascadeAction = RegCascadeAction & {
  task: 'cascade';
};

type EXPORT_ACTION = CascadeAction;

export type PageAction = EXPORT_ACTION & { act: 'pages' };

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
  }
}

function pageReducer(
  elms: Record<string, EditorSubprocess>,
  action: PageAction
): Record<string, EditorSubprocess> {
  switch (action.task) {
    case 'cascade':
      return cascadeReducer(elms, action);
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
        return pageReducer(pages, action);
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
