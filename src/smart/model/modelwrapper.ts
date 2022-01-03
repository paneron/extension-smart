/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { Elements } from 'react-flow-renderer';
import { MMELNode } from '../serialize/interface/baseinterface';
import { MMELModel } from '../serialize/interface/model';
import {
  MMELDataClass,
  MMELRegistry,
} from '../serialize/interface/datainterface';
import {
  EditorDataClass,
  EditorModel,
  EditorNode,
  EditorRegistry,
  EditorSubprocess,
  isEditorApproval,
  isEditorDataClass,
  isEditorProcess,
  isEditorRegistry,
  ModelType,
} from './editormodel';
import {
  MMELEdge,
  MMELSubprocess,
  MMELSubprocessComponent,
} from '../serialize/interface/flowcontrolinterface';
import { isDataClass, isStartEvent } from '../serialize/util/validation';
import {
  createDataLinkContainer,
  createEdgeContainer,
  createNodeContainer,
  EdgeContainer,
  getEditorNodeCallBack,
  NodeCallBack,
} from './FlowContainer';
import { fillRDCS, Logger } from '../utils/ModelFunctions';
import {
  getMappedList,
  getRefNodeStyle,
  getSourceStyleById,
  MapResultType,
} from '../utils/map/MappingCalculator';
import { MapSet } from './mapmodel';
import React from 'react';
import { SerializedStyles } from '@emotion/react';
import { MMELRepo, RepoIndex } from './repo';

export interface ModelWrapper {
  model: EditorModel;
  page: string;
  type: 'model';
}

function exploreData(
  x: EditorRegistry | EditorDataClass,
  nodes: Record<string, EditorNode>,
  es: Map<string, MMELRegistry | MMELDataClass>,
  elms: Elements
) {
  const data = isEditorRegistry(x) ? nodes[x.data] : x;
  if (data && isEditorDataClass(data)) {
    data.rdcs.forEach(id => {
      const e = nodes[id] as EditorDataClass;
      if (e) {
        if (e.mother !== '') {
          const m = nodes[e.mother] as EditorRegistry;
          if (!es.has(m.id)) {
            es.set(m.id, m);
            exploreData(m, nodes, es, elms);
          }
          const ne = createDataLinkContainer(x, m);
          elms.push(ne);
        } else {
          if (!es.has(e.id)) {
            es.set(e.id, e);
            exploreData(e, nodes, es, elms);
          }
          const ne = createDataLinkContainer(x, e);
          elms.push(ne);
        }
      } else {
        Logger.log('Error! Dataclass ID not found:', id);
      }
    });
  }
}

function convertElms(
  elms: Record<string, MMELNode>
): Record<string, EditorNode> {
  const output: Record<string, EditorNode> = {};
  for (const x in elms) {
    const item = elms[x];
    if (isDataClass(item)) {
      const newdc: EditorDataClass = {
        ...item,
        added: false,
        pages: new Set<string>(),
        objectVersion: 'Editor',
        rdcs: new Set<string>(),
        mother: '',
      };
      output[x] = newdc;
    } else {
      output[x] = {
        ...item,
        added: false,
        pages: new Set<string>(),
        objectVersion: 'Editor',
      };
    }
  }
  return output;
}

function convertPages(
  elms: Record<string, MMELSubprocess>,
  nodes: Record<string, EditorNode>
): Record<string, EditorSubprocess> {
  const output: Record<string, EditorSubprocess> = {};
  for (const x in elms) {
    output[x] = {
      ...elms[x],
      start: findStart(elms[x].childs, nodes),
      objectVersion: 'Editor',
      neighbor: {},
    };
  }
  return output;
}

function findStart(
  coms: Record<string, MMELSubprocessComponent>,
  nodes: Record<string, EditorNode>
): string {
  for (const x in coms) {
    const node = nodes[coms[x].element];
    if (isStartEvent(node)) {
      return node.id;
    }
  }
  throw new Error('Start event is not found in subprocess');
}

function resetAdded(model: EditorModel) {
  for (const x in model.elements) {
    model.elements[x].added = false;
  }
}

export function createEditorModelWrapper(m: MMELModel): ModelWrapper {
  const convertedElms = convertElms(m.elements);
  const converedPages = convertPages(m.pages, convertedElms);
  return buildStructure({
    model: { ...m, elements: convertedElms, pages: converedPages },
    page: m.root,
    type: 'model',
  });
}

export function MMELToEditorModel(m: MMELModel): EditorModel {
  const convertedElms = convertElms(m.elements);
  const converedPages = convertPages(m.pages, convertedElms);
  const model: EditorModel = {
    ...m,
    elements: convertedElms,
    pages: converedPages,
  };
  indexStructure(model);
  return model;
}

function indexStructure(model: EditorModel) {
  for (const p in model.pages) {
    const page = model.pages[p];
    for (const x in page.childs) {
      const com = page.childs[x];
      const elm = model.elements[com.element];
      elm.pages.add(page.id);
    }
  }
  for (const d in model.elements) {
    const data = model.elements[d];
    if (isEditorDataClass(data)) {
      fillRDCS(data, model.elements);
    } else if (isEditorRegistry(data)) {
      const dc = model.elements[data.data];
      if (isEditorDataClass(dc)) {
        dc.mother = data.id;
      }
    }
  }
}

function buildStructure(mw: ModelWrapper): ModelWrapper {
  const model = mw.model;
  indexStructure(model);
  return mw;
}

export function getEditorReactFlowElementsFrom(
  page: string,
  model: EditorModel,
  index: RepoIndex,
  dvisible: boolean,
  edgeDelete: boolean,
  onProcessClick: (pageid: string, processid: string) => void,
  removeEdge: (id: string) => void,
  getStyleById: (id: string) => SerializedStyles,
  getSVGColorById: (id: string) => string,
  idVisible: boolean,
  commentVisible: boolean,
  addComment: (msg: string, pid: string, parent?: string) => void,
  toggleCommentResolved: (cid: string) => void,
  deleteComment: (cid: string, pid: string, parent?: string) => void
): Elements {
  const callback = getEditorNodeCallBack({
    type: ModelType.EDIT,
    model: model,
    onProcessClick,
    getStyleClassById: getStyleById,
    getSVGColorById,
    idVisible,
    index,
    commentVisible,
    addComment,
    toggleCommentResolved,
    deleteComment,
  });
  try {
    // return getElements({page, model, type:'model'}, dvisible, callback, e =>
    //   createEdgeContainer(e, edgeDelete, removeEdge)
    return pageToFlowElements(
      model.pages[page],
      model.elements,
      dvisible,
      callback,
      e => createEdgeContainer(e, edgeDelete, removeEdge)
    );
  } catch (e: unknown) {
    const error = e as Error;
    Logger.log(error.message);
    Logger.log(error.stack);
  }
  return [];
}

export function getEditorReferenceFlowElementsFrom(
  mw: ModelWrapper,
  index: RepoIndex,
  dvisible: boolean,
  onProcessClick: (pageid: string, processid: string) => void,
  getStyleById: (id: string) => SerializedStyles,
  getSVGColorById: (id: string) => string,
  idVisible: boolean,
  goToNextModel: (x: MMELRepo) => void
): Elements {
  const callback = getEditorNodeCallBack({
    type: ModelType.EDITREF,
    model: mw.model,
    onProcessClick,
    getStyleClassById: getStyleById,
    getSVGColorById,
    idVisible,
    index,
    goToNextModel,
  });
  return getElements(mw, dvisible, callback, e => createEdgeContainer(e));
}

export function getViewerReactFlowElementsFrom(
  mw: ModelWrapper,
  index: RepoIndex,
  dvisible: boolean,
  onProcessClick: (pageid: string, processid: string) => void,
  getStyleById: (id: string) => SerializedStyles,
  getSVGColorById: (id: string) => string,
  idVisible: boolean,
  goToNextModel: (x: MMELRepo) => void,
  ComponentDesc?: React.FC<{ id: string }>,
  NodeAddon?: React.FC<{ id: string }>,
  getEdgeColor?: (id: string) => string,
  isAnimated?: (id: string) => boolean,
  ViewStartEndComponentDesc?: React.FC<{ id: string }>
): Elements {
  const callback = getEditorNodeCallBack({
    type: ModelType.EDIT,
    model: mw.model,
    onProcessClick,
    getStyleClassById: getStyleById,
    getSVGColorById,
    ComponentShortDescription: ComponentDesc,
    NodeAddon,
    idVisible,
    ViewStartEndComponentDesc,
    index,
    goToNextModel,
  });
  return getElements(mw, dvisible, callback, e =>
    createEdgeContainer(e, undefined, undefined, getEdgeColor, isAnimated)
  );
}

export function getActionReactFlowElementsFrom(
  mw: ModelWrapper,
  index: RepoIndex,
  dvisible: boolean,
  onProcessClick: (pageid: string, processid: string) => void,
  getStyleById: (id: string) => SerializedStyles,
  getSVGColorById: (id: string) => string,
  onDataWorkspaceActive: (id: string) => void,
  idVisible: boolean
): Elements {
  const callback = getEditorNodeCallBack({
    type: ModelType.EDIT,
    model: mw.model,
    onProcessClick,
    getStyleClassById: getStyleById,
    getSVGColorById,
    onDataWorkspaceActive,
    idVisible,
    index,
  });
  return getElements(mw, dvisible, callback, e => createEdgeContainer(e));
}

export function getMapperReactFlowElementsFrom(
  mw: ModelWrapper,
  index: RepoIndex,
  type: ModelType,
  dvisible: boolean,
  onProcessClick: (pageid: string, processid: string) => void,
  setMapping: (fromid: string, toid: string) => void,
  mapSet: MapSet,
  diffMapSet: MapSet | undefined,
  mapResult: MapResultType,
  diffMapResult: MapResultType | undefined,
  setSelectedId: (id: string) => void,
  isParentFull: boolean,
  isDiffParentFull: boolean | undefined,
  ComponentShortDescription: React.FC<{ id: string }>,
  MappingList: React.FC<{ id: string }>,
  idVisible: boolean,
  goToNextModel?: (x: MMELRepo) => void
): Elements {
  const destinationList = getMappedList(mapSet);
  const callback = getEditorNodeCallBack({
    type,
    model: mw.model,
    onProcessClick,
    setMapping,
    getStyleClassById:
      type === ModelType.REF
        ? getRefNodeStyle(
            isParentFull,
            isDiffParentFull,
            mapResult,
            diffMapResult
          )
        : id => getSourceStyleById(mapSet, diffMapSet, id),
    setSelectedId,
    hasMapping:
      type === ModelType.REF
        ? id => destinationList.has(id)
        : id => mapSet.mappings[id] !== undefined,
    ComponentShortDescription,
    MappingList,
    idVisible,
    index,
    goToNextModel,
  });
  return getElements(mw, dvisible, callback, e => createEdgeContainer(e));
}

function pageToFlowElements(
  page: EditorSubprocess,
  elms: Record<string, EditorNode>,
  dvisible: boolean,
  callback: NodeCallBack,
  createEdge: (e: MMELEdge) => EdgeContainer
): Elements {
  const nodes: Elements = Object.values(page.childs).flatMap(x =>
    elms[x.element]
      ? [createNodeContainer(elms[x.element], { x: x.x, y: x.y }, callback)]
      : []
  );
  const data: Elements = dvisible
    ? Object.values(page.data).flatMap(x =>
        elms[x.element]
          ? [createNodeContainer(elms[x.element], { x: x.x, y: x.y }, callback)]
          : []
      )
    : [];
  const edges: Elements = Object.values(page.edges).map(x => createEdge(x));
  if (dvisible) {
    for (const x of Object.values(page.childs)) {
      const elm = elms[x.element];
      if (isEditorProcess(elm)) {
        for (const input of elm.input) {
          edges.push(createDataLinkContainer(elms[input], elm));
        }
        for (const input of elm.output) {
          edges.push(createDataLinkContainer(elm, elms[input]));
        }
      } else if (isEditorApproval(elm)) {
        for (const input of elm.records) {
          edges.push(createDataLinkContainer(elm, elms[input]));
        }
      }
    }
    for (const x of Object.values(page.data)) {
      const data = elms[x.element];
      const dc = isEditorRegistry(data) ? elms[data.data] : data;
      if (isEditorDataClass(dc)) {
        for (const y of dc.rdcs) {
          const target = elms[y];
          const dep =
            isEditorDataClass(target) && elms[target.mother]
              ? elms[target.mother]
              : target;
          edges.push(createDataLinkContainer(data, dep));
        }
      }
    }
  }
  return [...nodes, ...data, ...edges];
}

function getElements(
  mw: ModelWrapper,
  dvisible: boolean,
  callback: NodeCallBack,
  createEdge: (e: MMELEdge) => EdgeContainer
) {
  resetAdded(mw.model);
  const elms: Elements = [];
  const datas = new Map<string, EditorRegistry | EditorDataClass>();
  const page = mw.model.pages[mw.page];
  for (const x in page.childs) {
    const com = page.childs[x];
    const child = mw.model.elements[com.element];
    if (child !== undefined && !child.added) {
      const exploreDataNode = (r: string, incoming: boolean) => {
        const reg = mw.model.elements[r];
        if (reg && isEditorRegistry(reg)) {
          if (!datas.has(reg.id)) {
            datas.set(reg.id, reg);
            exploreData(reg, mw.model.elements, datas, elms);
          }
          const ne = incoming
            ? createDataLinkContainer(reg, child)
            : createDataLinkContainer(child, reg);
          elms.push(ne);
        }
      };

      const nn = createNodeContainer(child, { x: com.x, y: com.y }, callback);
      elms.push(nn);
      child.added = true;
      if (dvisible) {
        if (isEditorProcess(child)) {
          child.input.forEach(r => exploreDataNode(r, true));
          child.output.forEach(r => exploreDataNode(r, false));
        }
        if (isEditorApproval(child)) {
          child.records.forEach(r => exploreDataNode(r, false));
        }
      }
    }
  }
  if (dvisible) {
    for (const x in page.data) {
      const com = page.data[x];
      const elm = mw.model.elements[com.element];
      if (elm !== undefined && datas.has(elm.id)) {
        const nn = createNodeContainer(elm, { x: com.x, y: com.y }, callback);
        elms.push(nn);
        elm.added = true;
      }
    }
    datas.forEach(e => {
      if (!e.added) {
        const nn = createNodeContainer(e, { x: 0, y: 0 }, callback);
        elms.push(nn);
      }
    });
  }
  for (const x in page.edges) {
    const ec = createEdge(page.edges[x]);
    elms.push(ec);
  }
  return elms;
}
