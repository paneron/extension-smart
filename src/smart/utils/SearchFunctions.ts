import { SerializedStyles } from '@emotion/react';
import { search_style__highlight } from '../../css/visual';
import {
  EditorApproval,
  EditorDataClass,
  EditorEGate,
  EditorModel,
  EditorNode,
  EditorProcess,
  EditorRegistry,
  EditorSignalEvent,
  EditorSubprocess,
  EditorTimerEvent,
  isEditorApproval,
  isEditorDataClass,
  isEditorProcess,
  isEditorRegistry,
} from '../model/editormodel';
import {
  addToHistory,
  cloneHistory,
  createPageHistory,
  PageHistory,
} from '../model/history';
import { LegendInterface } from '../model/States';
import { DataType } from '../serialize/interface/baseinterface';
import { isRegistry } from '../serialize/util/validation';
import { SearchableNodeTypes } from './constants';
import { isSearchableNodeTypes } from './typecheckings';

type SearchResultType = 'Process' | 'Approval' | 'Data' | 'Event' | 'Gateway';

export enum SearchHighlightType {
  SELECTED = 'selected',
  MATCH = 'match',
  NONE = 'none',
}

export const SearchResultStyles: Record<SearchHighlightType, LegendInterface> =
  {
    [SearchHighlightType.SELECTED]: { label: 'Selected', color: 'lightyellow' },
    [SearchHighlightType.MATCH]: { label: 'Match', color: 'lightblue' },
    [SearchHighlightType.NONE]: { label: 'Not match', color: '' },
  };

export interface SearchComponentRecord {
  id: string;
  text: string;
  page: string;
  type: SearchResultType;
  history: PageHistory;
}

const matchFunctions: Record<
  SearchableNodeTypes,
  (props: {
    model: EditorModel;
    node: EditorNode;
    search: string;
  }) => SearchResultType | null
> = {
  [DataType.PROCESS]: ({ model, node, search }) =>
    searchProcess(model, node as EditorProcess, search),
  [DataType.APPROVAL]: ({ node, search }) =>
    searchApproval(node as EditorApproval, search),
  [DataType.TIMEREVENT]: ({ node, search }) =>
    searchTimer(node as EditorTimerEvent, search),
  [DataType.SIGNALCATCHEVENT]: ({ node, search }) =>
    searchSignalCatch(node as EditorSignalEvent, search),
  [DataType.EGATE]: ({ node, search }) =>
    searchEGate(node as EditorEGate, search),
};

export function findPageContainingElement(
  model: EditorModel,
  id: string
): EditorSubprocess | null {
  for (const x in model.pages) {
    const page = model.pages[x];
    if (page.childs[id] !== undefined) {
      return page;
    }
  }
  return null;
}

export function findComponent(
  model: EditorModel,
  search: string
): SearchComponentRecord[] {
  const result: SearchComponentRecord[] = [];
  const page = model.pages[model.root];
  const history = createPageHistory({
    model: model,
    page: model.root,
    type: 'model',
  });
  if (page !== undefined && search !== '') {
    searchPageForComponent(
      page,
      model,
      search.toLowerCase(),
      result,
      new Set<string>(),
      history
    );
  }
  return result;
}

function searchPageForComponent(
  page: EditorSubprocess,
  model: EditorModel,
  search: string,
  result: SearchComponentRecord[],
  visited: Set<string>,
  history: PageHistory
): void {
  for (const x in page.childs) {
    const id = page.childs[x].element;
    const node = model.elements[id];
    if (node !== undefined && !visited.has(node.id)) {
      visited.add(node.id);
      const match = nodeMatch(model, node, search);
      if (match !== null) {
        result.push({
          id: node.id,
          text: getSearchDescription(node),
          page: page.id,
          type: match,
          history: history,
        });
      }
      if (isEditorProcess(node) && node.page !== '') {
        const nextpage = model.pages[node.page];
        const nextHistory = cloneHistory(history);
        addToHistory(nextHistory, node.page, id);
        if (nextpage !== undefined) {
          searchPageForComponent(
            nextpage,
            model,
            search,
            result,
            new Set<string>(),
            nextHistory
          );
        }
      }
    }
  }
  for (const x in page.data) {
    const id = page.data[x].element;
    const node = model.elements[id];
    if (isEditorRegistry(node)) {
      const match = searchRegistry(node, search);
      if (match !== null) {
        result.push({
          id: node.id,
          text: getSearchDescription(node),
          page: page.id,
          type: match,
          history: history,
        });
      }
      const dc = model.elements[node.data];
      if (match === null && isEditorDataClass(dc)) {
        const matchdc = searchDC(dc, search);
        if (matchdc !== null) {
          result.push({
            id: node.id,
            text: getSearchDescription(node),
            page: page.id,
            type: 'Data',
            history: history,
          });
        }
      }
    } else if (isEditorDataClass(node)) {
      const match = searchDC(node, search);
      if (match !== null) {
        result.push({
          id: node.id,
          text: getSearchDescription(node),
          page: page.id,
          type: match,
          history: history,
        });
      }
    }
  }
}

function searchProcess(
  model: EditorModel,
  process: EditorProcess,
  search: string
): SearchResultType | null {
  if (
    process.id.toLowerCase().includes(search) ||
    process.name.toLowerCase().includes(search)
  ) {
    return 'Process';
  }
  for (const x of process.provision) {
    const pro = model.provisions[x];
    if (pro.condition.toLowerCase().includes(search)) {
      return 'Process';
    }
  }
  for (const x of process.notes) {
    const note = model.notes[x];
    if (note.message.toLowerCase().includes(search)) {
      return 'Process';
    }
  }
  for (const x of process.links) {
    const link = model.links[x];
    if (
      link.title.toLowerCase().includes(search) ||
      link.link.toLowerCase().includes(search)
    ) {
      return 'Process';
    }
  }
  return null;
}

function searchApproval(
  approval: EditorApproval,
  search: string
): SearchResultType | null {
  if (
    approval.id.toLowerCase().includes(search) ||
    approval.name.toLowerCase().includes(search)
  ) {
    return 'Approval';
  }
  return null;
}

function searchTimer(
  timer: EditorTimerEvent,
  search: string
): SearchResultType | null {
  if (timer.id.toLowerCase().includes(search)) {
    return 'Event';
  }
  return null;
}

function searchSignalCatch(
  ev: EditorSignalEvent,
  search: string
): SearchResultType | null {
  if (
    ev.id.toLowerCase().includes(search) ||
    ev.signal.toLowerCase().includes(search)
  ) {
    return 'Event';
  }
  return null;
}

function searchEGate(
  egate: EditorEGate,
  search: string
): SearchResultType | null {
  if (
    egate.id.toLowerCase().includes(search) ||
    egate.label.toLowerCase().includes(search)
  ) {
    return 'Gateway';
  }
  return null;
}

function searchRegistry(
  reg: EditorRegistry,
  search: string
): SearchResultType | null {
  if (
    reg.id.toLowerCase().includes(search) ||
    reg.title.toLowerCase().includes(search)
  ) {
    return 'Data';
  }
  return null;
}

function searchDC(
  dc: EditorDataClass,
  search: string
): SearchResultType | null {
  for (const a in dc.attributes) {
    const att = dc.attributes[a];
    if (
      att.id.toLocaleLowerCase().includes(search) ||
      att.definition.toLowerCase().includes(search)
    ) {
      return 'Data';
    }
  }
  return null;
}

function nodeMatch(
  model: EditorModel,
  node: EditorNode,
  search: string
): SearchResultType | null {
  if (isSearchableNodeTypes(node.datatype)) {
    const matchFunc = matchFunctions[node.datatype];
    return matchFunc({ model, node, search });
  }
  return null;
}

function getSearchDescription(node: EditorNode): string {
  if (isEditorProcess(node) || isEditorApproval(node)) {
    return node.name;
  }
  if (isRegistry(node)) {
    return node.title;
  }
  return node.id;
}

export function getHighlightedStyleById(
  id: string,
  selected: string | null,
  set: Set<string>
): SerializedStyles {
  if (id === selected) {
    return search_style__highlight(SearchHighlightType.SELECTED);
  } else if (set.has(id)) {
    return search_style__highlight(SearchHighlightType.MATCH);
  }
  return search_style__highlight(SearchHighlightType.NONE);
}

export function getHighlightedSVGColorById(
  id: string,
  selected: string | null,
  set: Set<string>
): string {
  if (id === selected) {
    return SearchResultStyles.selected.color;
  } else if (set.has(id)) {
    return SearchResultStyles.match.color;
  }
  return SearchResultStyles.none.color === ''
    ? 'none'
    : SearchResultStyles.none.color;
}
