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
import VersionDiffLogView from '../ui/version/VersionDiffLogView';
import { getRootName } from './ModelFunctions';

const ComparisonResultStyles: Record<VersionStatus, LegendInterface> = {
  'same'   : { label : 'Identical', color : 'lightblue' },
  'add'    : { label : 'Added', color : 'lightgreen' },
  'delete' : { label : 'Removed', color : 'red' },
  'change' : { label : 'Modified', color : 'lightyellow' },
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
      page     : page.id,
      pathtext : getRootName(model.meta),
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
        page     : elm.page,
        pathtext : elm.id,
      });
      page = model.pages[elm.page];
    } else {
      break;
    }
  }
  mw.page = newItems[newItems.length - 1].page;
  return { items : newItems };
}

export function getDiffViewProps(data: VersionState): ViewFunctionInterface {
  return {
    getStyleById,
    getSVGColorById,
    getEdgeColor,
    legendList       : ComparisonResultStyles,
    ComponentToolTip : VersionDiffLogView,
    StartEndToolTip  : VersionDiffLogView,
    data,
  };
}

export function computeDiff(
  mw: ModelWrapper,
  refMW: ModelWrapper,
  option: React.MutableRefObject<boolean>
): VersionState {
  const state: VersionState = {
    orielements   : {},
    oriedges      : {},
    oripages      : {},
    oricomments   : {},
    refelements   : {},
    refedges      : {},
    refpages      : {},
    refcomments   : {},
    viewOptionRef : option,
  };
  const model = mw.model;
  const ref = refMW.model;
  const root = model.pages[model.root];
  const refroot = ref.pages[ref.root];
  matchPage({
    page    : root,
    refpage : refroot,
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
): string[] {
  const { model, ref, state } = props;
  const comments: string[] = [];

  if (p1.name !== p2.name) {
    comments.push(`Name changed ${p2.name} => ${p1.name}`);
  }

  if (p1.actor !== p2.actor) {
    comments.push(`Actor changed ${p2.actor} => ${p1.actor}`);
  }

  for (const x of p1.input) {
    if (!p2.input.has(x)) {
      comments.push(`Added input: ${x}`);
    }
  }

  for (const x of p2.input) {
    if (!p1.input.has(x)) {
      comments.push(`Removed input: ${x}`);
    }
  }

  for (const x of p1.output) {
    if (!p2.output.has(x)) {
      comments.push(`Added output: ${x}`);
    }
  }

  for (const x of p2.output) {
    if (!p1.output.has(x)) {
      comments.push(`Removed output: ${x}`);
    }
  }

  for (const x of p1.provision) {
    const pro1 = model.provisions[x];
    let found = false;
    for (const y of p2.provision) {
      const pro2 = ref.provisions[y];
      if (
        pro1.condition.trim().toLowerCase() ===
          pro2.condition.trim().toLowerCase() &&
        pro1.modality === pro2.modality
      ) {
        found = true;
        break;
      }
    }
    if (!found) {
      comments.push(`Added provision [${pro1.modality}]: ${pro1.condition}`);
    }
  }

  for (const x of p2.provision) {
    const pro1 = ref.provisions[x];
    let found = false;
    for (const y of p1.provision) {
      const pro2 = model.provisions[y];
      if (
        pro1.condition.trim().toLowerCase() ===
          pro2.condition.trim().toLowerCase() &&
        pro1.modality === pro2.modality
      ) {
        found = true;
        break;
      }
    }
    if (!found) {
      comments.push(`Removed provision [${pro1.modality}]: ${pro1.condition}`);
    }
  }

  if (p1.page !== '' && p2.page !== '') {
    const page = model.pages[p1.page];
    const refpage = ref.pages[p2.page];
    if (!matchPage({ ...props, page, refpage })) {
      comments.push('Change in subprocess');
    }
  } else if (p1.page !== '') {
    const page = model.pages[p1.page];
    labelSubPages(
      page,
      model,
      'add',
      'New component',
      state.orielements,
      state.oricomments
    );
    comments.push('Added subprocess');
  } else if (p2.page !== '') {
    const page = ref.pages[p2.page];
    labelSubPages(
      page,
      ref,
      'delete',
      'Removed component',
      state.refelements,
      state.refcomments
    );
    comments.push('Removed subprocess');
  }

  return comments;
}

function checkApproval(p1: EditorApproval, p2: EditorApproval): string[] {
  const comments: string[] = [];
  if (p1.actor !== p2.actor) {
    comments.push(`Actor changed ${p2.actor} => ${p1.actor}`);
  }

  if (p1.approver !== p2.approver) {
    comments.push(`Approver changed ${p2.actor} => ${p1.actor}`);
  }

  for (const x of p1.records) {
    if (!p2.records.has(x)) {
      comments.push(`Added record: ${x}`);
    }
  }

  for (const x of p2.records) {
    if (!p1.records.has(x)) {
      comments.push(`Removed record: ${x}`);
    }
  }

  if (p1.modality !== p2.modality) {
    comments.push(`Changed modality: ${p2.modality} => ${p1.modality}`);
  }

  if (p1.name !== p2.name) {
    comments.push(`Name changed ${p2.name} => ${p1.name}`);
  }

  return comments;
}

function checkEGate(e1: EditorEGate, e2: EditorEGate): string[] {
  if (e1.label !== e2.label) {
    return [`Changed gateway description: ${e2.label} => ${e1.label}`];
  }

  return [];
}

function checkTimer(e1: EditorTimerEvent, e2: EditorTimerEvent): string[] {
  const comments: string[] = [];
  if (e1.type !== e2.type) {
    comments.push(`Changed type: ${e2.type} => ${e1.type}`);
  }

  if (e1.para !== e2.para) {
    comments.push(`Changed parameter: ${e2.para} => ${e1.para}`);
  }

  return comments;
}

function checkSignal(e1: EditorSignalEvent, e2: EditorSignalEvent): string[] {
  if (e1.signal !== e2.signal) {
    return [`Changed signal: ${e2.signal} => ${e1.signal}`];
  }

  return [];
}

function checkRegistry(
  r1: EditorRegistry,
  r2: EditorRegistry,
  props: FunctionProps
): string[] {
  const comments: string[] = [];
  const { model, ref } = props;
  if (r1.title !== r2.title) {
    comments.push(`Changed title: ${r2.title} => ${r1.title}`);
  }

  const dc1 = model.elements[r1.data];
  const dc2 = ref.elements[r2.data];
  if (
    dc1 !== undefined &&
    dc2 !== undefined &&
    isEditorDataClass(dc1) &&
    isEditorDataClass(dc2)
  ) {
    return [...comments, ...checkDC(dc1, dc2)];
  }
  return comments;
}

function checkDC(dc1: EditorDataClass, dc2: EditorDataClass): string[] {
  const comments: string[] = [];
  const att1 = dc1.attributes;
  const att2 = dc2.attributes;

  for (const x in att1) {
    const a1 = att1[x];
    const a2 = att2[x];
    if (a2 !== undefined) {
      if (a1.definition !== a2.definition) {
        comments.push(
          `Changed attribute definition ${a1.id}: ${a2.definition} => ${a1.definition}`
        );
      }
      if (a1.cardinality !== a2.cardinality) {
        comments.push(
          `Changed attribute cardinality ${a1.id}: ${a2.cardinality} => ${a1.cardinality}`
        );
      }
      if (a1.modality !== a2.modality) {
        comments.push(
          `Changed attribute modality ${a1.id}: ${a2.modality} => ${a1.modality}`
        );
      }
    } else {
      comments.push(`Added attribute ${a1.id}`);
    }
  }

  return comments;
}

function matchPage(props: FunctionProps): boolean {
  const { page, refpage, model, ref, state } = props;
  let ret = true;
  state.orielements[page.id] = {};
  state.refelements[refpage.id] = {};
  state.oricomments[page.id] = {};
  state.refcomments[refpage.id] = {};
  for (const c in page.childs) {
    const child = model.elements[c];
    const refchild = refpage.childs[c];
    const refelm = ref.elements[c];
    if (refchild === undefined) {
      state.orielements[page.id][c] = 'add';
      state.oricomments[page.id][c] = ['New component'];
      if (isEditorProcess(child) && child.page !== '') {
        const nextPage = model.pages[child.page];
        labelSubPages(
          nextPage,
          model,
          'add',
          'New component',
          state.orielements,
          state.oricomments
        );
      }
      ret = false;
    } else {
      state.oricomments[page.id][c] = [];
      state.refcomments[refpage.id][c] = [];
      if (child.datatype === refelm.datatype) {
        if (isEditorProcess(child) && isEditorProcess(refelm)) {
          const comments = checkProcess(child, refelm, props);
          const label = comments.length > 0 ? 'change' : 'same';
          state.orielements[page.id][c] = label;
          state.refelements[refpage.id][c] = label;
          state.oricomments[page.id][c] = comments;
          state.refcomments[refpage.id][c] = comments;
          if (label !== 'same') {
            ret = false;
          }
        } else if (isEditorApproval(child) && isEditorApproval(refelm)) {
          const comments = checkApproval(child, refelm);
          const label = comments.length > 0 ? 'change' : 'same';
          state.orielements[page.id][c] = label;
          state.refelements[refpage.id][c] = label;
          state.oricomments[page.id][c] = comments;
          state.refcomments[refpage.id][c] = comments;
          if (label !== 'same') {
            ret = false;
          }
        } else if (isEditorEgate(child) && isEditorEgate(refelm)) {
          const comments = checkEGate(child, refelm);
          const label = comments.length > 0 ? 'change' : 'same';
          state.orielements[page.id][c] = label;
          state.refelements[refpage.id][c] = label;
          state.oricomments[page.id][c] = comments;
          state.refcomments[refpage.id][c] = comments;
          if (label !== 'same') {
            ret = false;
          }
        } else if (isEditorTimerEvent(child) && isEditorTimerEvent(refelm)) {
          const comments = checkTimer(child, refelm);
          const label = comments.length > 0 ? 'change' : 'same';
          state.orielements[page.id][c] = label;
          state.refelements[refpage.id][c] = label;
          state.oricomments[page.id][c] = comments;
          state.refcomments[refpage.id][c] = comments;
          if (label !== 'same') {
            ret = false;
          }
        } else if (isEditorSignalEvent(child) && isEditorSignalEvent(refelm)) {
          const comments = checkSignal(child, refelm);
          const label = comments.length > 0 ? 'change' : 'same';
          state.orielements[page.id][c] = label;
          state.refelements[refpage.id][c] = label;
          state.oricomments[page.id][c] = comments;
          state.refcomments[refpage.id][c] = comments;
          if (label !== 'same') {
            ret = false;
          }
        } else {
          state.orielements[page.id][c] = 'same';
          state.refelements[refpage.id][c] = 'same';
          state.oricomments[page.id][c] = [];
          state.refcomments[refpage.id][c] = [];
        }
      } else {
        state.orielements[page.id][c] = 'add';
        state.orielements[refpage.id][c] = 'delete';
        state.oricomments[page.id][c] = ['New component'];
        state.refcomments[refpage.id][c] = ['Removed component'];
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
      state.oricomments[page.id][c] = ['New component'];
      ret = false;
    } else {
      if (child.datatype === refelm.datatype) {
        if (isEditorRegistry(child) && isEditorRegistry(refelm)) {
          const comments = checkRegistry(child, refelm, props);
          const label = comments.length > 0 ? 'change' : 'same';
          state.orielements[page.id][c] = label;
          state.refelements[refpage.id][c] = label;
          state.oricomments[page.id][c] = comments;
          state.refcomments[refpage.id][c] = comments;
          if (label !== 'same') {
            ret = false;
          }
        } else if (isEditorDataClass(child) && isEditorDataClass(refelm)) {
          const comments = checkDC(child, refelm);
          const label = comments.length > 0 ? 'change' : 'same';
          state.orielements[page.id][c] = label;
          state.refelements[refpage.id][c] = label;
          state.oricomments[page.id][c] = comments;
          state.refcomments[refpage.id][c] = comments;
          if (label !== 'same') {
            ret = false;
          }
        }
      } else {
        state.orielements[page.id][c] = 'add';
        state.orielements[refpage.id][c] = 'delete';
        state.oricomments[page.id][c] = ['New component'];
        state.refcomments[refpage.id][c] = ['Removed component'];
        ret = false;
      }
    }
  }

  for (const c in refpage.childs) {
    if (page.childs[c] === undefined) {
      const child = ref.elements[c];
      state.refelements[refpage.id][c] = 'delete';
      state.refcomments[refpage.id][c] = ['Removed component'];
      if (isEditorProcess(child) && child.page !== '') {
        const nextPage = ref.pages[child.page];
        labelSubPages(
          nextPage,
          ref,
          'delete',
          'Removed component',
          state.refelements,
          state.refcomments
        );
      }
      ret = false;
    }
  }
  for (const c in refpage.data) {
    if (page.data[c] === undefined) {
      state.refelements[page.id][c] = 'delete';
      state.refcomments[refpage.id][c] = ['Removed component'];
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
          state.oricomments[page.id][e1.from].push(
            `Changed edge description to ${e1.to}: ${e2.description} => ${e1.description}`
          );
          state.refcomments[refpage.id][e1.from].push(
            `Changed edge description to ${e1.to}: ${e2.description} => ${e1.description}`
          );
        }
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
      const e1 = page.edges[x];
      state.oricomments[page.id][e1.from].push(`Added edge to ${e1.to}`);
      ret = false;
    }
  }

  for (const x in refpage.edges) {
    if (state.refedges[refpage.id][x] === undefined) {
      state.refedges[refpage.id][x] = 'delete';
      const e1 = refpage.edges[x];
      state.refcomments[refpage.id][e1.from].push(`Removed edge to ${e1.to}`);
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
  comment: string,
  result: Record<string, Record<string, VersionStatus>>,
  comments: Record<string, Record<string, string[]>>
) {
  result[page.id] = {};
  comments[page.id] = {};
  for (const c in page.childs) {
    result[page.id][c] = label;
    comments[page.id][c] = [comment];
    const child = model.elements[c];
    if (isEditorProcess(child) && child.page !== '') {
      const nextPage = model.pages[child.page];
      labelSubPages(nextPage, model, label, comment, result, comments);
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
