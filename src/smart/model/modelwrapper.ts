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
import { fillRDCS } from '../utils/ModelFunctions';
import {
  getMappedList,
  getMapStyleById,
  getSourceStyleById,
  MapCoverType,
  MapResultType,
} from '../utils/MappingCalculator';
import { MapSet } from './mapmodel';
import { map_style__coverage } from '../../css/visual';
import React from 'react';

export interface ModelWrapper {
  model: EditorModel;
  page: string;
}

function exploreData(
  x: EditorRegistry,
  nodes: Record<string, EditorNode>,
  es: Map<string, MMELRegistry | MMELDataClass>,
  elms: Elements
) {
  const data = nodes[x.data];
  if (data !== undefined && isEditorDataClass(data)) {
    data.rdcs.forEach(id => {
      const e = nodes[id] as EditorDataClass;
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
        }
        const ne = createDataLinkContainer(x, e);
        elms.push(ne);
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
  });
}

function buildStructure(mw: ModelWrapper): ModelWrapper {
  const model = mw.model;
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
  return mw;
}

export function getReactFlowElementsFrom(
  mw: ModelWrapper,
  dvisible: boolean,
  edgeDelete: boolean,
  onProcessClick: (pageid: string, processid: string) => void,
  removeEdge: (id: string) => void
): Elements {
  const callback = getEditorNodeCallBack({
    type: ModelType.EDIT,
    model: mw.model,
    onProcessClick,
  });
  return getElements(mw, dvisible, callback, e =>
    createEdgeContainer(e, edgeDelete, removeEdge)
  );
}

export function getMapperReactFlowElementsFrom(
  mw: ModelWrapper,
  type: ModelType,
  dvisible: boolean,
  onProcessClick: (pageid: string, processid: string) => void,
  setMapping: (fromid: string, toid: string) => void,
  mapSet: MapSet,
  mapResult: MapResultType,
  setSelectedId: (id: string) => void,
  isParentFull: boolean,
  ComponentShortDescription: React.FC<{id:string}>,
  MappingList: React.FC<{id: string}>
): Elements {
  const destinationList = getMappedList(mapSet);
  const callback = getEditorNodeCallBack({
    type,
    model: mw.model,
    onProcessClick,
    setMapping,
    getMapStyleClassById:
      type === ModelType.REF
        ? isParentFull
          ? () => map_style__coverage(MapCoverType.FULL)
          : id => getMapStyleById(mapResult, id)
        : id => getSourceStyleById(mapSet, id),
    setSelectedId,
    hasMapping:
      type === ModelType.REF
        ? id => destinationList.has(id)
        : id => mapSet.mappings[id] !== undefined,
    ComponentShortDescription,
    MappingList
  });
  return getElements(mw, dvisible, callback, e => createEdgeContainer(e));
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
        if (isEditorRegistry(reg)) {
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
      } else {
        delete page.data[x];
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
