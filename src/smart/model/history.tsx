/**
 * Legacy data model for page history.
 * The new method is to use the useHistory in the editor.
 * This legacy data model is still used by other function modules like viewer / mapper.
 */

import React from 'react';
import { getRootName } from '../utils/ModelFunctions';
import { HistoryAction } from './editor/history';
import { EditorModel } from './editormodel';
import { ModelWrapper } from './modelwrapper';
import { MMELRepo } from './repo';

interface Breadcrumb {
  label: JSX.Element;
  onNavigate: () => void;
}

export interface HistoryItem {
  page: string;
  pathtext: string;
}

export interface PageHistory {
  items: HistoryItem[];
}

export interface EditHistoryItem {
  mw: ModelWrapper;
  phistory: PageHistory;
}

export interface EditHistory {
  past: EditHistoryItem[];
  future: EditHistoryItem[];
}

export type RepoHistory = MMELRepo[];

export function cloneHistory(history: PageHistory): PageHistory {
  return {
    items: history.items.map(item => ({
      page: item.page,
      pathtext: item.pathtext,
    })),
  };
}

export function createPageHistory(mw: ModelWrapper): PageHistory {
  return {
    items: createModelHistory(mw.model),
  };
}

export function createModelHistory(model: EditorModel): HistoryItem[] {
  const meta = model.meta;
  return [
    {
      page: model.root,
      pathtext: getRootName(meta),
    },
  ];
}

export function getBreadcrumbs(
  ph: PageHistory,
  onPageChange: (updated: PageHistory, newPage: string) => void
): Breadcrumb[] {
  const breadcrumbs: Breadcrumb[] = [];
  ph.items.forEach((item, index) => {
    breadcrumbs.push({
      label: <>{item.pathtext}</>,
      onNavigate: () => {
        const page = popUntil(ph, index);
        onPageChange(ph, page);
      },
    });
  });
  return breadcrumbs;
}

export function getBreadcrumbsActions(
  history: HistoryItem[],
  onPageChange: (x: HistoryAction) => void
): Breadcrumb[] {
  return history.map((his, index) => ({
    label: <>{his.pathtext}</>,
    onNavigate: () =>
      onPageChange({
        type: 'history',
        act: 'pop',
        value: history.length - index - 1,
      }),
  }));
}

export function addToHistory(
  ph: PageHistory,
  pageid: string,
  label: string
): void {
  ph.items.push({
    page: pageid,
    pathtext: label,
  });
}

export function popPage(ph: PageHistory): string {
  if (ph.items.length > 1) {
    ph.items.pop();
  }
  return ph.items[ph.items.length - 1].page;
}

export function popUntil(ph: PageHistory, i: number): string {
  while (i + 1 < ph.items.length) {
    ph.items.pop();
  }
  return ph.items[ph.items.length - 1].page;
}
