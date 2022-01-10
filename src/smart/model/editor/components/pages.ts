import { useReducer } from 'react';
import {
  MMELEdge,
  MMELSubprocess,
} from '../../../serialize/interface/flowcontrolinterface';
import { createSubprocessComponent } from '../../../utils/EditorFactory';
import {
  dataPageReplace,
  elmPageReplace,
} from '../../../utils/handler/cascadeModelHandler';
import { Logger, updatePageElement } from '../../../utils/ModelFunctions';
import {
  EditorNode,
  EditorSubprocess,
  isEditorApproval,
  isEditorDataClass,
  isEditorProcess,
  isEditorRegistry,
} from '../../editormodel';
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
};

type DeleteElementAction = {
  task: 'delete-element';
  value: EditorNode;
  page: string;
};

type AddChildAction = {
  task: 'add-child';
  ids: [string, number, number][];
  page: string;
};

type RemoveChildAction = {
  task: 'remove-child';
  ids: string[];
  page: string;
};

type NewEdgeAction = {
  task: 'new-edge';
  value: MMELEdge[];
  page: string;
};

type DeleteEdgeAction = {
  task: 'delete-edge';
  value: string[];
  page: string;
};

type EditEdgeAction = {
  task: 'edit-edge';
  value: MMELEdge[];
  page: string;
};

type NewPageAction = {
  task: 'new-page';
  value: EditorSubprocess[];
};

type DeletePageAction = {
  task: 'delete-page';
  value: string[];
};

type MoveAction = {
  task: 'move';
  node: string;
  page: string;
  nodetype: 'node' | 'data';
  x: number;
  y: number;
  fromx: number;
  fromy: number;
};

type ReplaceElmIdAction = {
  task: 'replace-id';
  page: string;
  id: string;
  value: string;
};

type EXPORT_ACTION =
  | CascadeAction
  | NewElementAction
  | DeleteElementAction
  | MoveAction
  | NewEdgeAction
  | DeleteEdgeAction
  | EditEdgeAction
  | ReplaceElmIdAction
  | NewPageAction
  | DeletePageAction
  | AddChildAction
  | RemoveChildAction;

export type PageAction = EXPORT_ACTION & {
  act: 'pages';
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
      return elmPageReplace(
        pages,
        [[action.page, action.x, action.y]],
        undefined,
        action.value.id
      );
    }
    case 'delete-element': {
      return elmPageReplace(
        pages,
        [[action.page, 0, 0]],
        action.value.id,
        undefined
      );
    }
    case 'new-edge': {
      return newEdge(pages, action.page, action.value);
    }
    case 'delete-edge': {
      return deleteEdge(pages, action.page, action.value);
    }
    case 'edit-edge': {
      return editEdge(pages, action.page, action.value);
    }
    case 'move': {
      return moveElm(
        pages,
        action.page,
        action.nodetype,
        action.node,
        action.x,
        action.y
      );
    }
    case 'replace-id': {
      return replaceId(pages, action.page, action.id, action.value);
    }
    case 'new-page': {
      return addPage(pages, action.value);
    }
    case 'delete-page': {
      return deletePage(pages, action.value);
    }
    case 'add-child': {
      return addChild(pages, action.page, action.ids);
    }
    case 'remove-child': {
      return removeChild(pages, action.page, action.ids);
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
        return pageReducer({ ...pages }, action);
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
        value: action.value,
      };
    case 'delete-element': {
      const compo = pages[action.page].childs[action.value.id];
      return {
        act: 'pages',
        task: 'new-element',
        page: action.page,
        value: action.value,
        x: compo.x,
        y: compo.y,
      };
    }
    case 'new-edge':
      return {
        act: 'pages',
        task: 'delete-edge',
        page: action.page,
        value: action.value.map(x => x.id),
      };
    case 'delete-edge': {
      const edge = action.value.map(x => pages[action.page].edges[x]);
      return {
        act: 'pages',
        task: 'new-edge',
        page: action.page,
        value: edge,
      };
    }
    case 'edit-edge': {
      const edge = action.value.map(x => pages[action.page].edges[x.id]);
      return {
        act: 'pages',
        task: 'edit-edge',
        page: action.page,
        value: edge,
      };
    }
    case 'move': {
      return {
        act: 'pages',
        task: 'move',
        page: action.page,
        node: action.node,
        nodetype: action.nodetype,
        x: action.fromx,
        y: action.fromy,
        fromx: action.x,
        fromy: action.y,
      };
    }
    case 'replace-id': {
      return {
        act: 'pages',
        task: 'replace-id',
        page: action.page,
        id: action.value,
        value: action.id,
      };
    }
    case 'new-page': {
      return {
        act: 'pages',
        task: 'delete-page',
        value: action.value.map(v => v.id),
      };
    }
    case 'delete-page': {
      return {
        act: 'pages',
        task: 'new-page',
        value: action.value.map(v => pages[v]),
      };
    }
    case 'add-child': {
      return {
        act: 'pages',
        task: 'remove-child',
        page: action.page,
        ids: action.ids.map(x => x[0]),
      };
    }
    case 'remove-child': {
      return {
        act: 'pages',
        task: 'add-child',
        page: action.page,
        ids: action.ids.map(x => {
          const p = pages[action.page];
          const compo = p.childs[x];
          return [x, compo ? compo.x : 0, compo ? compo.y : 0];
        }),
      };
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
  pages: Record<string, MMELSubprocess>,
  action: PageAction
): ModelAction[] | undefined {
  if (action.cascade) {
    return undefined;
  }
  if (action.task === 'new-element') {
    action.cascade = [
      {
        type: 'model',
        act: 'elements',
        task: 'add',
        subtask: 'flowunit',
        value: [action.value],
      },
    ];
    return [
      {
        type: 'model',
        act: 'elements',
        task: 'delete',
        subtask: 'flowunit',
        value: [action.value.id],
      },
    ];
  } else if (action.task === 'delete-element') {
    const edges = pages[action.page].edges;
    const eids = findRelatedEdges(edges, action.value.id);
    action.cascade = [
      {
        type: 'model',
        act: 'elements',
        task: 'delete',
        subtask: 'flowunit',
        value: [action.value.id],
      },
      {
        type: 'model',
        act: 'pages',
        task: 'delete-edge',
        page: action.page,
        value: eids,
      },
    ];
    return [
      {
        type: 'model',
        act: 'elements',
        task: 'add',
        subtask: 'flowunit',
        value: [action.value],
      },
      {
        type: 'model',
        act: 'pages',
        task: 'new-edge',
        page: action.page,
        value: eids.map(x => edges[x]),
      },
    ];
  }
  return [];
}

function moveElm(
  pages: Record<string, EditorSubprocess>,
  page: string,
  nodetype: 'node' | 'data',
  id: string,
  x: number,
  y: number
): Record<string, EditorSubprocess> {
  // Logger.log('move', id, nodetype, x, y);
  // Logger.log('before change', pages[page]);
  const p = { ...pages[page] };
  if (nodetype === 'node') {
    p.childs = {
      ...p.childs,
      [id]: { ...p.childs[id], x: Math.round(x), y: Math.round(y) },
    };
  } else {
    p.data = {
      ...p.data,
      [id]: { ...p.data[id], x: Math.round(x), y: Math.round(y) },
    };
  }
  pages[page] = p;
  // Logger.log('after change', pages[page]);
  return pages;
}

export function explorePageDataNodes(
  page: EditorSubprocess,
  elms: Record<string, EditorNode>
): [PageAction[], PageAction[]] {
  // Logger.log('Explore data');
  const actions: PageAction[] = [];
  const reverse: PageAction[] = [];
  const set = new Set<string>();
  for (const x of Object.values(page.childs)) {
    const elm = elms[x.element];
    if (elm) {
      if (isEditorProcess(elm)) {
        exploreList(elm.input, elms, set);
        exploreList(elm.output, elms, set);
      } else if (isEditorApproval(elm)) {
        exploreList(elm.records, elms, set);
      }
    }
  }
  for (const x of Object.values(page.data)) {
    if (set.has(x.element)) {
      set.delete(x.element);
    } else {
      actions.push({
        act: 'pages',
        task: 'cascade',
        subtask: 'data',
        from: x.element,
        to: undefined,
        ids: [[page.id, 0, 0]],
      });
      reverse.push({
        act: 'pages',
        task: 'cascade',
        subtask: 'data',
        to: x.element,
        from: undefined,
        ids: [[page.id, x.x, x.y]],
      });
    }
  }
  for (const x of set) {
    actions.push({
      act: 'pages',
      task: 'cascade',
      subtask: 'data',
      from: undefined,
      to: x,
      ids: [[page.id, 0, 0]],
    });
    reverse.push({
      act: 'pages',
      task: 'cascade',
      subtask: 'data',
      to: undefined,
      from: x,
      ids: [[page.id, 0, 0]],
    });
  }
  // Logger.log('Actions', actions, reverse);
  return [actions, reverse];
}

function exploreList(
  list: Set<string>,
  elms: Record<string, EditorNode>,
  set: Set<string>
) {
  for (const x of list) {
    const elm = elms[x];
    const data = isEditorDataClass(elm) && elm.mother !== '' ? elm.mother : x;
    if (!set.has(data)) {
      set.add(data);
      exploreData(x, elms, set);
    }
  }
}

function exploreData(
  id: string,
  elms: Record<string, EditorNode>,
  set: Set<string>
) {
  const node = elms[id];
  const data = isEditorRegistry(node) ? elms[node.data] : node;
  if (data && isEditorDataClass(data)) {
    exploreList(data.rdcs, elms, set);
  }
}

function newEdge(
  pages: Record<string, EditorSubprocess>,
  page: string,
  edges: MMELEdge[]
): Record<string, EditorSubprocess> {
  const newPage = { ...pages[page] };
  for (const edge of edges) {
    newPage.edges = { ...newPage.edges, [edge.id]: edge };
  }
  pages[page] = newPage;
  return pages;
}

function replaceId(
  pages: Record<string, EditorSubprocess>,
  page: string,
  id: string,
  newId: string
) {
  const p = { ...pages[page] };
  updatePageElement(p, id, newId);
  pages[page] = p;
  return pages;
}

function addPage(
  pages: Record<string, EditorSubprocess>,
  value: EditorSubprocess[]
) {
  for (const v of value) {
    pages[v.id] = v;
  }
  return pages;
}

function addChild(
  pages: Record<string, EditorSubprocess>,
  pageid: string,
  ids: [string, number, number][]
): Record<string, EditorSubprocess> {
  // Logger.log('Adding', ids, pageid);
  const page = { ...pages[pageid] };
  const childs = { ...page.childs };
  for (const item of ids) {
    const [elm, x, y] = item;
    const compo = createSubprocessComponent(elm);
    compo.x = x;
    compo.y = y;
    childs[elm] = compo;
  }
  page.childs = childs;
  pages[pageid] = page;
  return pages;
}

function removeChild(
  pages: Record<string, EditorSubprocess>,
  pageid: string,
  ids: string[]
): Record<string, EditorSubprocess> {
  const page = { ...pages[pageid] };
  const childs = { ...page.childs };
  for (const item of ids) {
    delete childs[item];
  }
  page.childs = childs;
  pages[pageid] = page;
  return pages;
}

function deletePage(pages: Record<string, EditorSubprocess>, value: string[]) {
  for (const v of value) {
    delete pages[v];
  }
  return pages;
}

function deleteEdge(
  pages: Record<string, EditorSubprocess>,
  page: string,
  edgeids: string[]
): Record<string, EditorSubprocess> {
  const newPage = { ...pages[page] };
  const edges = { ...newPage.edges };
  for (const id of edgeids) {
    delete edges[id];
  }
  newPage.edges = edges;
  pages[page] = newPage;
  return pages;
}

function editEdge(
  pages: Record<string, EditorSubprocess>,
  page: string,
  edges: MMELEdge[]
): Record<string, EditorSubprocess> {
  const newPage = { ...pages[page] };
  for (const edge of edges) {
    newPage.edges = { ...newPage.edges, [edge.id]: { ...edge } };
  }
  pages[page] = newPage;
  return pages;
}

function findRelatedEdges(
  edges: Record<string, MMELEdge>,
  id: string
): string[] {
  const ids: string[] = [];
  for (const e of Object.values(edges)) {
    if (e.from === id || e.to === id) {
      ids.push(e.id);
    }
  }
  return ids;
}
