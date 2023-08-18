import type {
  EditorModel,
  EditorNode,
  EditorSubprocess } from '@/smart/model/editormodel';
import {
  isEditorApproval,
  isEditorProcess,
} from '@/smart/model/editormodel';
import type {
  PageHistory } from '@/smart/model/history';
import {
  addToHistory,
  cloneHistory,
  createPageHistory
} from '@/smart/model/history';
import type { LegendInterface } from '@/smart/model/States';

export enum SearchHighlightType {
  SELECTED = 'selected',
  MATCH = 'match',
  NONE = 'none',
}

export interface RegSummarySearchRecord {
  id: string;
  text: string;
  page: string;
  type: string;
  history: PageHistory;
}

export const DataSummaryStyles: Record<SearchHighlightType, LegendInterface> = {
  [SearchHighlightType.SELECTED] : { label : 'Selected', color : 'lightyellow' },
  [SearchHighlightType.MATCH]    : { label : 'Match', color : 'lightblue' },
  [SearchHighlightType.NONE]     : { label : 'Not match', color : '' },
};

export function computeRegistrySummary(
  model: EditorModel,
  id: string
): RegSummarySearchRecord[] {
  const result: RegSummarySearchRecord[] = [];
  const page = model.pages[model.root];
  const history = createPageHistory({
    model : model,
    page  : model.root,
    type  : 'model',
  });
  if (page !== undefined && id !== '') {
    searchPageForComponent(page, model, id, result, new Set<string>(), history);
  }
  return result;
}

function searchPageForComponent(
  page: EditorSubprocess,
  model: EditorModel,
  targetid: string,
  result: RegSummarySearchRecord[],
  visited: Set<string>,
  history: PageHistory
): void {
  for (const x in page.childs) {
    const id = page.childs[x].element;
    const node = model.elements[id];
    if (node !== undefined && !visited.has(node.id)) {
      visited.add(node.id);
      if (isEditorProcess(node)) {
        for (const reg of node.input) {
          if (reg === targetid) {
            result.push({
              id      : node.id,
              text    : getSearchDescription(node),
              page    : page.id,
              type    : 'Input to Process',
              history : history,
            });
          }
        }
        for (const reg of node.output) {
          if (reg === targetid) {
            result.push({
              id      : node.id,
              text    : getSearchDescription(node),
              page    : page.id,
              type    : 'Output of Process',
              history : history,
            });
          }
        }
        if (node.page !== '') {
          const nextpage = model.pages[node.page];
          const nextHistory = cloneHistory(history);
          addToHistory(nextHistory, node.page, id);
          if (nextpage !== undefined) {
            searchPageForComponent(
              nextpage,
              model,
              targetid,
              result,
              new Set<string>(),
              nextHistory
            );
          }
        }
      } else if (isEditorApproval(node)) {
        for (const reg of node.records) {
          if (reg === targetid) {
            result.push({
              id      : node.id,
              text    : getSearchDescription(node),
              page    : page.id,
              type    : 'Approval records',
              history : history,
            });
          }
        }
      }
    }
  }
}

function getSearchDescription(node: EditorNode): string {
  if (isEditorProcess(node) || isEditorApproval(node)) {
    return node.name;
  }
  return node.id;
}
