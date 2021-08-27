import { EditorModel, EditorNode, EditorSubprocess, isEditorProcess } from "../model/editormodel";
import { addToHistory, cloneHistory, createPageHistory, PageHistory } from "../model/history";
import { Logger } from "./ModelFunctions";

type SearchResultType = 
  | 'Process'
  | 'Approval'
  | 'Input to Process'
  | 'Output to Process'
  | 'Event'
  | 'Gateway'

export interface SearchComponentRecord {
  id: string;
  page: string;
  type: SearchResultType;
  history: PageHistory;
}

export function findPageContainingElement(model: EditorModel, id: string): EditorSubprocess | null {
  for (const x in model.pages) {
    const page = model.pages[x];
    if (page.childs[id] !== undefined) {
      return page;
    }
  }
  return null;
}

export function findComponent(model: EditorModel, search: string): SearchComponentRecord[] {
  Logger.logger.log('Perform search');
  const result:SearchComponentRecord[] = [];
  const page = model.pages[model.root];
  const history = createPageHistory({
    model: model,
    page: model.root
  })
  if (page !== undefined) {
    searchPageForComponent(page, model, search, result, new Set<string>(), history);
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
):void {
  for (const x in page.childs) {
    const id = page.childs[x].element
    const node = model.elements[id];
    if (node !== undefined && !visited.has(node.id)) {
      visited.add(node.id);
      const match = nodeMatch(node, search);
      if (match !== null) {
        result.push({
          id: node.id,
          page: page.id,
          type: match,
          history: history
        });
      }
      if (isEditorProcess(node) && node.page !== '') {
        const nextpage = model.pages[node.page];
        const nextHistory = cloneHistory(history);
        addToHistory(nextHistory, node.page, id);                      
        if (nextpage !== undefined) {
          searchPageForComponent(nextpage, model, search, result, visited, nextHistory);
        }
      }
    }
  }
}

function nodeMatch(node: EditorNode, search: string):SearchResultType|null {
  return 'Process';
}