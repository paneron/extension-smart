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
  EditorStartEvent,
  EditorSubprocess,
  isEditorAppproval,
  isEditorDataClass,
  isEditorProcess,
  isEditorRegistry,
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
  getNodeCallBack,
} from '../ui/flowui/container';

export interface ModelWrapper {
  model: EditorModel;
  page: EditorSubprocess;
}

function exploreData(
  x: EditorRegistry,
  nodes: Record<string, EditorNode>,
  es: Map<string, MMELRegistry | MMELDataClass>,
  elms: Elements
) {
  const data = nodes[x.data];
  if (data !== undefined && isEditorDataClass(data)) {
    data.rdcs.forEach(e => {
      const m = e.mother;
      if (m !== null) {
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
        child: new Set<MMELEdge>(),
        added: false,
        pages: new Set<EditorSubprocess>(),
        objectVersion: 'Editor',
        rdcs: new Set<EditorDataClass>(),
        mother: null,
      };
      output[x] = newdc;
    } else {
      output[x] = {
        ...item,
        child: new Set<MMELEdge>(),
        added: false,
        pages: new Set<EditorSubprocess>(),
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
    };
  }
  return output;
}

function findStart(
  coms: Record<string, MMELSubprocessComponent>,
  nodes: Record<string, EditorNode>
): EditorStartEvent {
  for (const x in coms) {
    const node = nodes[coms[x].element];
    if (isStartEvent(node)) {
      return node;
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
    page: converedPages[m.root],
  });
}

function buildStructure(mw: ModelWrapper): ModelWrapper {
  const model = mw.model;
  for (const p in model.pages) {
    const page = model.pages[p];
    for (const e in page.edges) {
      const edge = page.edges[e];
      const from = model.elements[edge.from];
      if (from !== undefined) {
        from.child.add(edge);
      }
    }
    for (const x in page.childs) {
      const com = page.childs[x];
      const elm = model.elements[com.element];
      elm.pages.add(page);
    }
  }
  for (const d in model.elements) {
    const data = model.elements[d];
    if (isEditorDataClass(data)) {
      for (const a in data.attributes) {
        const att = data.attributes[a];
        let type = att.type;
        const i1 = type.indexOf('(');
        const i2 = type.indexOf(')');
        if (i1 !== -1 && i2 !== -1) {
          type = type.substr(i1 + 1, i2 - i1 - 1);
        }
        if (type !== '') {
          const ret = model.elements[type];
          if (ret !== undefined && isEditorDataClass(ret)) {
            data.rdcs.add(ret);
          }
        }
      }
    } else if (isEditorRegistry(data)) {
      const dc = model.elements[data.data];
      if (isEditorDataClass(dc)) {
        dc.mother = data;
      }
    }
  }
  return mw;
}

export function getReactFlowElementsFrom(
  mw: ModelWrapper,
  dvisible: boolean,
  onProcessClick: (pageid: string, processid: string) => void
): Elements {
  const callback = getNodeCallBack(mw.model, onProcessClick);

  resetAdded(mw.model);
  const elms: Elements = [];
  const datas = new Map<string, EditorRegistry | EditorDataClass>();
  for (const x in mw.page.childs) {
    const com = mw.page.childs[x];
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
        if (isEditorAppproval(child)) {
          child.records.forEach(r => exploreDataNode(r, false));
        }
      }
    }
  }
  if (dvisible) {
    for (const x in mw.page.data) {
      const com = mw.page.data[x];
      const elm = mw.model.elements[com.element];
      if (elm !== undefined && datas.has(elm.id)) {
        const nn = createNodeContainer(elm, { x: com.x, y: com.y }, callback);
        elms.push(nn);
        elm.added = true;
      } else {
        delete mw.page.data[x];
      }
    }
    datas.forEach(e => {
      if (!e.added) {
        const nn = createNodeContainer(e, { x: 0, y: 0 }, callback);
        elms.push(nn);
      }
    });
  }
  for (const x in mw.page.edges) {
    const ec = createEdgeContainer(mw.page.edges[x]);
    elms.push(ec);
  }
  return elms;
}
