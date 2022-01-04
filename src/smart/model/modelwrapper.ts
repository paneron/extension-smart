/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { Elements } from 'react-flow-renderer';
import { MMELNode } from '../serialize/interface/baseinterface';
import { MMELModel } from '../serialize/interface/model';
import {
  EditorDataClass,
  EditorModel,
  EditorNode,
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
import { EditorViewOption } from './States';

export interface ModelWrapper {
  model: EditorModel;
  page: string;
  type: 'model';
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
        pages: new Set<string>(),
        objectVersion: 'Editor',
        rdcs: new Set<string>(),
        mother: '',
      };
      output[x] = newdc;
    } else {
      output[x] = {
        ...item,
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
  view: EditorViewOption,
  onProcessClick: (pageid: string, processid: string) => void,
  removeEdge: (id: string) => void,
  getStyleById: (id: string) => SerializedStyles,
  getSVGColorById: (id: string) => string,
  addComment: (msg: string, pid: string, parent?: string) => void,
  toggleCommentResolved: (cid: string) => void,
  deleteComment: (cid: string, pid: string, parent?: string) => void
): Elements {
  const callback = getEditorNodeCallBack({
    ...view,
    type: ModelType.EDIT,
    model: model,
    onProcessClick,
    getStyleClassById: getStyleById,
    getSVGColorById,
    index,
    addComment,
    toggleCommentResolved,
    deleteComment,
  });
  try {
    return pageToFlowElements(
      model.pages[page],
      model.elements,
      view.dvisible,
      callback,
      e => createEdgeContainer(e, view.edgeDeleteVisible, removeEdge)
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
  return pageToFlowElements(
    mw.model.pages[mw.page],
    mw.model.elements,
    dvisible,
    callback,
    e => createEdgeContainer(e)
  );
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
  return pageToFlowElements(
    mw.model.pages[mw.page],
    mw.model.elements,
    dvisible,
    callback,
    e => createEdgeContainer(e, undefined, undefined, getEdgeColor, isAnimated)
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
  return pageToFlowElements(
    mw.model.pages[mw.page],
    mw.model.elements,
    dvisible,
    callback,
    e => createEdgeContainer(e)
  );
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
  return pageToFlowElements(
    mw.model.pages[mw.page],
    mw.model.elements,
    dvisible,
    callback,
    e => createEdgeContainer(e)
  );
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
          if (elms[input]) {
            edges.push(createDataLinkContainer(elms[input], elm));
          }
        }
        for (const input of elm.output) {
          if (elms[input]) {
            edges.push(createDataLinkContainer(elm, elms[input]));
          }
        }
      } else if (isEditorApproval(elm)) {
        for (const input of elm.records) {
          if (elms[input]) {
            edges.push(createDataLinkContainer(elm, elms[input]));
          }
        }
      }
    }
    for (const x of Object.values(page.data)) {
      const data = elms[x.element];
      const dc = data && isEditorRegistry(data) ? elms[data.data] : data;
      if (dc && isEditorDataClass(dc)) {
        for (const y of dc.rdcs) {
          const target = elms[y];
          if (target) {
            const dep =
              isEditorDataClass(target) && elms[target.mother]
                ? elms[target.mother]
                : target;
            edges.push(createDataLinkContainer(data, dep));
          }
        }
      }
    }
  }
  return [...nodes, ...data, ...edges];
}
