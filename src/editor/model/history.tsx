import React from 'react';
import { EditorSubprocess } from './editormodel';
import { ModelWrapper } from './modelwrapper';

interface Breadcrumb {
  label: JSX.Element;
  onNavigate: () => void;
}

export interface HistoryItem {
  page: EditorSubprocess;
  pathtext: string;
}

export interface PageHistory {
  history: HistoryItem[];
}

export function createPageHistory(mw: ModelWrapper): PageHistory {
  return {
    history: [
      {
        page: mw.model.pages[mw.model.root],
        pathtext:
          mw.model.meta.namespace === '' ? 'root' : mw.model.meta.namespace,
      },
    ],
  };
}

export function getBreadcrumbs(
  ph: PageHistory,
  onPageChange: (updated: PageHistory, newPage: EditorSubprocess) => void
): Breadcrumb[] {
  const breadcrumbs: Breadcrumb[] = [];
  ph.history.forEach((item, index) => {
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

export function addToHistory(ph: PageHistory, x: EditorSubprocess, y: string) {
  ph.history.push({
    page: x,
    pathtext: y,
  });
}

export function popPage(ph: PageHistory): EditorSubprocess {
  if (ph.history.length > 1) {
    ph.history.pop();
  }
  return ph.history[ph.history.length - 1].page;
}

export function popUntil(ph: PageHistory, i: number): EditorSubprocess {
  while (i + 1 < ph.history.length) {
    ph.history.pop();
  }
  return ph.history[ph.history.length - 1].page;
}
