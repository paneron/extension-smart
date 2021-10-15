import React from 'react';
import { flow_node__highlighed, no_highlight } from '../../css/visual';
import {
  EditorApproval,
  EditorDataClass,
  EditorEGate,
  EditorModel,
  EditorProcess,
  EditorRegistry,
  EditorSignalEvent,
  EditorSubprocess,
  EditorTimerEvent,
  isEditorApproval,
  isEditorDataClass,
  isEditorEgate,
  isEditorProcess,
  isEditorRegistry,
  isEditorSignalEvent,
  isEditorTimerEvent,
} from '../model/editormodel';
import { HistoryItem, PageHistory } from '../model/history';
import { ModelWrapper } from '../model/modelwrapper';
import { LegendInterface } from '../model/States';
import { VersionState, VersionStatus } from '../model/versioncompare';
import { ViewFunctionInterface } from '../model/ViewFunctionModel';
import { getRootName } from './ModelFunctions';

const ComparisonResultStyles: Record<VersionStatus, LegendInterface> = {
  same: { label: 'Identical', color: 'lightblue' },
  add: { label: 'Base model only', color: 'lightgreen' },
  delete: { label: 'Compared model only', color: 'red' },
  change: { label: 'Modified', color: 'lightyellow' },
};

export function getHistroyFromRefModel(
  mw: ModelWrapper,
  history: PageHistory
): PageHistory {
  const items = history.items;
  const model = mw.model;
  let page = model.pages[model.root];
  const newItems: HistoryItem[] = [
    {
      page: page.id,
      pathtext: getRootName(model.meta),
    },
  ];
  for (let i = 1; i < items.length; i++) {
    const item = items[i];
    const elm = model.elements[item.pathtext];
    if (
      page.childs[item.pathtext] !== undefined &&
      elm !== undefined &&
      isEditorProcess(elm) &&
      elm.page !== ''
    ) {
      newItems.push({
        page: elm.page,
        pathtext: elm.id,
      });
      page = model.pages[elm.page];
    } else {
      break;
    }
  }
  mw.page = newItems[newItems.length - 1].page;
  return { items: newItems };
}

export function getDiffViewProps(data: VersionState): ViewFunctionInterface {
  return {
    getStyleById,
    getSVGColorById,
    getEdgeColor,
    legendList: ComparisonResultStyles,
    data,
  };
}

export function computeDiff(
  mw: ModelWrapper,
  refMW: ModelWrapper,
  option: React.MutableRefObject<boolean>
): VersionState {
  const state: VersionState = {
    orielements: {},
    oriedges: {},
    oripages: {},
    refelements: {},
    refedges: {},
    refpages: {},
    viewOptionRef: option,
  };
  const model = mw.model;
  const ref = refMW.model;
  const root = model.pages[model.root];
  const refroot = ref.pages[ref.root];
  matchPage({
    page: root,
    refpage: refroot,
    model,
    ref,
    state,
  });
  return state;
}

interface FunctionProps {
  page: EditorSubprocess;
  refpage: EditorSubprocess;
  model: EditorModel;
  ref: EditorModel;
  state: VersionState;
}

function checkProcess(
  p1: EditorProcess,
  p2: EditorProcess,
  props: FunctionProps
): VersionStatus {
  const { model, ref, state } = props;

  if (p1.name !== p2.name) {
    return 'change';
  }

  if (p1.actor !== p2.actor) {
    return 'change';
  }

  if (p1.input.size !== p2.input.size) {
    return 'change';
  }
  for (const x of p1.input) {
    if (!p2.input.has(x)) {
      return 'change';
    }
  }

  if (p1.output.size !== p2.output.size) {
    return 'change';
  }
  for (const x of p1.output) {
    if (!p2.output.has(x)) {
      return 'change';
    }
  }

  const ps1 = new Set<string>();
  const ps2 = new Set<string>();
  p1.provision.forEach(x => {
    const pro = model.provisions[x];
    ps1.add(pro.condition.trim().toLowerCase() + ' ' + pro.modality);
  });
  p2.provision.forEach(x => {
    const pro = ref.provisions[x];
    ps2.add(pro.condition.trim().toLowerCase() + ' ' + pro.modality);
  });
  for (const x of ps1) {
    if (!ps2.has(x)) {
      return 'change';
    }
  }

  if (p1.page !== '' && p2.page !== '') {
    const page = model.pages[p1.page];
    const refpage = ref.pages[p2.page];
    return matchPage({ ...props, page, refpage }) ? 'same' : 'change';
  } else if (p1.page !== '') {
    const page = model.pages[p1.page];
    labelSubPages(page, model, 'add', state.orielements);
    return 'change';
  } else if (p2.page !== '') {
    const page = ref.pages[p2.page];
    labelSubPages(page, ref, 'delete', state.refelements);
    return 'change';
  }

  return 'same';
}

function checkApproval(p1: EditorApproval, p2: EditorApproval): VersionStatus {
  if (p1.actor !== p2.actor) {
    return 'change';
  }

  if (p1.approver !== p2.approver) {
    return 'change';
  }

  if (p1.records.size !== p2.records.size) {
    return 'change';
  }
  for (const x of p1.records) {
    if (!p2.records.has(x)) {
      return 'change';
    }
  }

  if (p1.modality !== p2.modality) {
    return 'change';
  }

  if (p1.name !== p2.name) {
    return 'change';
  }

  return 'same';
}

function checkEGate(e1: EditorEGate, e2: EditorEGate): VersionStatus {
  if (e1.label !== e2.label) {
    return 'change';
  }

  return 'same';
}

function checkTimer(e1: EditorTimerEvent, e2: EditorTimerEvent): VersionStatus {
  if (e1.type !== e2.type) {
    return 'change';
  }

  if (e1.para !== e2.para) {
    return 'change';
  }

  return 'same';
}

function checkSignal(
  e1: EditorSignalEvent,
  e2: EditorSignalEvent
): VersionStatus {
  if (e1.signal !== e2.signal) {
    return 'change';
  }

  return 'same';
}

function checkRegistry(
  r1: EditorRegistry,
  r2: EditorRegistry,
  props: FunctionProps
): VersionStatus {
  const { model, ref } = props;
  if (r1.title !== r2.title) {
    return 'change';
  }

  const dc1 = model.elements[r1.data];
  const dc2 = ref.elements[r2.data];
  if (
    dc1 !== undefined &&
    dc2 !== undefined &&
    isEditorDataClass(dc1) &&
    isEditorDataClass(dc2)
  ) {
    return checkDC(dc1, dc2);
  }
  return 'same';
}

function checkDC(dc1: EditorDataClass, dc2: EditorDataClass): VersionStatus {
  const att1 = dc1.attributes;
  const att2 = dc2.attributes;

  const set1 = new Set<string>();
  const set2 = new Set<string>();
  Object.values(att1).forEach(x => {
    set1.add(
      x.cardinality + ' ' + x.definition.trim() + ' ' + x.id + ' ' + x.modality
    );
  });
  Object.values(att2).forEach(x => {
    set2.add(
      x.cardinality + ' ' + x.definition.trim() + ' ' + x.id + ' ' + x.modality
    );
  });
  if (set1.size !== set2.size) {
    return 'change';
  }
  for (const x of set1) {
    if (!set2.has(x)) {
      return 'change';
    }
  }

  return 'same';
}

function matchPage(props: FunctionProps): boolean {
  const { page, refpage, model, ref, state } = props;
  let ret = true;
  state.orielements[page.id] = {};
  state.refelements[refpage.id] = {};
  for (const c in page.childs) {
    const child = model.elements[c];
    const refchild = refpage.childs[c];
    const refelm = ref.elements[c];
    if (refchild === undefined) {
      state.orielements[page.id][c] = 'add';
      if (isEditorProcess(child) && child.page !== '') {
        const nextPage = model.pages[child.page];
        labelSubPages(nextPage, model, 'add', state.orielements);
      }
      ret = false;
    } else {
      if (child.datatype === refelm.datatype) {
        if (isEditorProcess(child) && isEditorProcess(refelm)) {
          const label = checkProcess(child, refelm, props);
          state.orielements[page.id][c] = label;
          state.refelements[refpage.id][c] = label;
          if (label !== 'same') {
            ret = false;
          }
        } else if (isEditorApproval(child) && isEditorApproval(refelm)) {
          const label = checkApproval(child, refelm);
          state.orielements[page.id][c] = label;
          state.refelements[refpage.id][c] = label;
          if (label !== 'same') {
            ret = false;
          }
        } else if (isEditorEgate(child) && isEditorEgate(refelm)) {
          const label = checkEGate(child, refelm);
          state.orielements[page.id][c] = label;
          state.refelements[refpage.id][c] = label;
          if (label !== 'same') {
            ret = false;
          }
        } else if (isEditorTimerEvent(child) && isEditorTimerEvent(refelm)) {
          const label = checkTimer(child, refelm);
          state.orielements[page.id][c] = label;
          state.refelements[refpage.id][c] = label;
          if (label !== 'same') {
            ret = false;
          }
        } else if (isEditorSignalEvent(child) && isEditorSignalEvent(refelm)) {
          const label = checkSignal(child, refelm);
          state.orielements[page.id][c] = label;
          state.refelements[refpage.id][c] = label;
          if (label !== 'same') {
            ret = false;
          }
        } else {
          state.orielements[page.id][c] = 'same';
          state.refelements[refpage.id][c] = 'same';
        }
      } else {
        state.orielements[page.id][c] = 'add';
        state.orielements[refpage.id][c] = 'delete';
        ret = false;
      }
    }
  }

  for (const c in page.data) {
    const child = model.elements[c];
    const refchild = refpage.data[c];
    const refelm = ref.elements[c];
    if (refchild === undefined) {
      state.orielements[page.id][c] = 'add';
      ret = false;
    } else {
      if (child.datatype === refelm.datatype) {
        if (isEditorRegistry(child) && isEditorRegistry(refelm)) {
          const label = checkRegistry(child, refelm, props);
          state.orielements[page.id][c] = label;
          state.refelements[refpage.id][c] = label;
          if (label !== 'same') {
            ret = false;
          }
        } else if (isEditorDataClass(child) && isEditorDataClass(refelm)) {
          const label = checkDC(child, refelm);
          state.orielements[page.id][c] = label;
          state.refelements[refpage.id][c] = label;
          if (label !== 'same') {
            ret = false;
          }
        }
      } else {
        state.orielements[page.id][c] = 'add';
        state.orielements[refpage.id][c] = 'delete';
        ret = false;
      }
    }
  }

  for (const c in refpage.childs) {
    if (page.childs[c] === undefined) {
      const child = ref.elements[c];
      state.refelements[page.id][c] = 'delete';
      if (isEditorProcess(child) && child.page !== '') {
        const nextPage = ref.pages[child.page];
        labelSubPages(nextPage, ref, 'delete', state.refelements);
      }
      ret = false;
    }
  }
  for (const c in refpage.data) {
    if (page.data[c] === undefined) {
      state.refelements[page.id][c] = 'delete';
      ret = false;
    }
  }

  state.oriedges[page.id] = {};
  state.refedges[refpage.id] = {};
  for (const x in page.edges) {
    const e1 = page.edges[x];
    for (const y in refpage.edges) {
      const e2 = refpage.edges[y];
      if (e1.from === e2.from && e1.to === e2.to) {
        const label = e1.description === e2.description ? 'same' : 'change';
        state.oriedges[page.id][x] = label;
        state.refedges[refpage.id][y] = label;
        if (label !== 'same') {
          ret = false;
        }
        break;
      }
    }
  }

  for (const x in page.edges) {
    if (state.oriedges[page.id][x] === undefined) {
      state.oriedges[page.id][x] = 'add';
      ret = false;
    }
  }

  for (const x in refpage.edges) {
    if (state.refedges[refpage.id][x] === undefined) {
      state.refedges[refpage.id][x] = 'delete';
      ret = false;
    }
  }

  state.oripages[page.id] = ret;
  state.refpages[refpage.id] = ret;
  return ret;
}

function labelSubPages(
  page: EditorSubprocess,
  model: EditorModel,
  label: VersionStatus,
  result: Record<string, Record<string, VersionStatus>>
) {
  result[page.id] = {};
  for (const c in page.childs) {
    result[page.id][c] = label;
    const child = model.elements[c];
    if (isEditorProcess(child) && child.page !== '') {
      const nextPage = model.pages[child.page];
      labelSubPages(nextPage, model, label, result);
    }
  }
}

function getStyleById(id: string, pageid: string, data: unknown) {
  const result = data as VersionState;
  const isRef = result.viewOptionRef.current;
  const label = isRef
    ? result.refelements[pageid][id]
    : result.orielements[pageid][id];
  return label !== undefined
    ? flow_node__highlighed(ComparisonResultStyles[label].color)
    : no_highlight;
}

function getSVGColorById(id: string, pageid: string, data: unknown) {
  const result = data as VersionState;
  const isRef = result.viewOptionRef.current;
  const label = isRef
    ? result.refelements[pageid][id]
    : result.orielements[pageid][id];
  return label !== undefined ? ComparisonResultStyles[label].color : 'none';
}

function getEdgeColor(id: string, pageid: string, data: unknown): string {
  const result = data as VersionState;
  const isRef = result.viewOptionRef.current;
  const label = isRef
    ? result.refedges[pageid][id]
    : result.oriedges[pageid][id];
  return label !== undefined ? ComparisonResultStyles[label].color : 'none';
}
