import { useReducer } from 'react';
import {
  refDCReplace,
  regElmReplace,
  dcElmReplace,
  RoleAttribute,
  roleReplace,
  typeEnumReplace,
  tableReplace,
  figReplace,
} from '../../../utils/handler/cascadeModelHandler';
import { Logger } from '../../../utils/ModelFunctions';
import {
  EditorNode,
  isEditorDataClass,
  isEditorRegistry,
} from '../../editormodel';
import { UndoReducerInterface } from '../interface';
import { ModelAction } from '../model';
import { addCommonElms, delCommonElms, editCommonElms } from './element/common';
import { addDC, editDC } from './element/dc';
import {
  addRegistry,
  delRegistry,
  editRegistry,
  RegistryCombined,
} from './element/registry';
import { ItemAction } from './itemTemplate';

type RoleCascadeAction = {
  subtask: 'process-role';
  role: string;
  ids: [string, RoleAttribute[]][]; // [process or approval ID, attribute name];
};

type RefCascadeAction = {
  subtask: 'process-ref';
  from: string | undefined; // remove from
  to: string | undefined; // add to
  ids: [string, string[]][];
};

type RegCascadeAction = {
  subtask: 'process-reg';
  from: string | undefined; // remove from
  to: string | undefined; // add to
  ids: DataCascadeIDs[];
};

type DCCascadeAction = {
  subtask: 'process-dc';
  from: string | undefined; // remove from
  to: string | undefined; // add to
  ids: DataCascadeDCID[];
};

type EnumCascadeAction = {
  subtask: 'process-enum';
  datatype: string;
  ids: [string, string[]][]; // dcid, attribute ids
};

type TableCascadeAction = {
  subtask: 'process-table';
  from: string | undefined; // remove from
  to: string | undefined; // add to
  ids: string[]; // Process id
};

type FigCascadeAction = {
  subtask: 'process-figure';
  from: string | undefined; // remove from
  to: string | undefined; // add to
  ids: string[]; // Process id
};

type DataCascadeProcessID = {
  id: string;
  type: 'process';
  attributes: ('input' | 'output')[];
};

type DataCascadeOtherID = {
  id: string;
  type: 'other';
};

export type DataCascadeDCID = {
  id: string;
  type: 'dc';
  attributes: [string, string][]; // attribute id, new type
  rdcs: [string, string][]; // [oldid, newid]. Empty ==> no delete / add
};

export type DataCascadeIDs =
  | DataCascadeProcessID
  | DataCascadeOtherID
  | DataCascadeDCID;

type CascadeAction = (
  | RoleCascadeAction
  | RefCascadeAction
  | RegCascadeAction
  | DCCascadeAction
  | EnumCascadeAction
  | TableCascadeAction
  | FigCascadeAction
) & {
  task: 'cascade';
};

type CommonElmAction = ItemAction<EditorNode, 'elements'> &
  ({ subtask: 'registry' } | { subtask: 'dc' } | { subtask: 'flowunit' });

type EXPORT_ACTION = CascadeAction | CommonElmAction;

export type ElmAction = EXPORT_ACTION & {
  act: 'elements';
  cascade?: ModelAction[];
};

type InitAction = {
  act: 'init';
  value: Record<string, EditorNode>;
};

type OwnAction = ElmAction | InitAction;

function cascadeReducer(
  elms: Record<string, EditorNode>,
  action: CascadeAction
): Record<string, EditorNode> {
  switch (action.subtask) {
    case 'process-role':
      return roleReplace(elms, action.ids, action.role);
    case 'process-ref':
      return refDCReplace(elms, action.ids, action.from, action.to);
    case 'process-reg':
      return regElmReplace(elms, action.ids, action.from, action.to);
    case 'process-dc':
      return dcElmReplace(elms, action.ids);
    case 'process-enum':
      return typeEnumReplace(elms, action.ids, action.datatype);
    case 'process-table':
      return tableReplace(elms, action.ids, action.from, action.to);
    case 'process-figure':
      return figReplace(elms, action.ids, action.from, action.to);
  }
}

function elmReducer(
  elms: Record<string, EditorNode>,
  action: ElmAction
): Record<string, EditorNode> {
  switch (action.task) {
    case 'cascade':
      return cascadeReducer({ ...elms }, action);
    case 'add': {
      return addItem({ ...elms }, action);
    }
    case 'delete': {
      return delItem({ ...elms }, action);
    }
    case 'edit': {
      return editItem({ ...elms }, action);
    }
  }
}

function reducer(
  elms: Record<string, EditorNode>,
  action: OwnAction
): Record<string, EditorNode> {
  try {
    switch (action.act) {
      case 'init':
        return { ...action.value };
      case 'elements':
        return elmReducer(elms, action);
    }
  } catch (e: unknown) {
    if (typeof e === 'object') {
      const error = e as Error;
      Logger.log(error.message);
      Logger.log(error.stack);
    }
  }
  return elms;
}

function findReverse(
  elms: Record<string, EditorNode>,
  action: ElmAction
): ElmAction | undefined {
  switch (action.task) {
    case 'cascade':
      return undefined;
    case 'add': {
      return {
        act: 'elements',
        task: 'delete',
        subtask: action.subtask,
        value: action.value.map(x => x.id),
      };
    }
    case 'delete': {
      return {
        act: 'elements',
        task: 'add',
        subtask: action.subtask,
        value: action.value.map(x => findActionElement(elms, x)),
      };
    }
    case 'edit': {
      return {
        act: 'elements',
        task: 'edit',
        subtask: action.subtask,
        id: action.value.id,
        value: findActionElement(elms, action.id),
      };
    }
  }
}

export function useElements(
  x: Record<string, EditorNode>
): UndoReducerInterface<Record<string, EditorNode>, ElmAction> {
  const [elms, dispatchElms] = useReducer(reducer, x);

  function act(action: ElmAction): ElmAction | undefined {
    dispatchElms(action);
    return findReverse(elms, action);
  }

  function init(x: Record<string, EditorNode>) {
    dispatchElms({ act: 'init', value: x });
  }

  return [elms, act, init];
}

function delItem(
  elms: Record<string, EditorNode>,
  action: CommonElmAction & { task: 'delete' }
): Record<string, EditorNode> {
  switch (action.subtask) {
    case 'registry':
      return delRegistry(elms, action.value);
    default:
      return delCommonElms(elms, action.value);
  }
}

function addItem(
  elms: Record<string, EditorNode>,
  action: CommonElmAction & { task: 'add' }
): Record<string, EditorNode> {
  switch (action.subtask) {
    case 'registry':
      return addRegistry(elms, action.value);
    case 'dc':
      return addDC(elms, action.value);
    default:
      return addCommonElms(elms, action.value);
  }
}

function editItem(
  elms: Record<string, EditorNode>,
  action: CommonElmAction & { task: 'edit' }
): Record<string, EditorNode> {
  switch (action.subtask) {
    case 'registry':
      return editRegistry(elms, action.id, action.value);
    case 'dc':
      return editDC(elms, action.id, action.value);
    default:
      return editCommonElms(elms, action.id, action.value);
  }
}

export function findActionElement(
  elms: Record<string, EditorNode>,
  id: string
): EditorNode {
  const elm = elms[id];
  if (elm) {
    if (isEditorRegistry(elm)) {
      const dc = elms[elm.data];
      if (isEditorDataClass(dc)) {
        const combined: RegistryCombined = { ...dc, id, title: elm.title };
        return combined;
      }
    }
  } else {
    Logger.log('Cannot find element', id, elms);
  }
  return elm;
}
