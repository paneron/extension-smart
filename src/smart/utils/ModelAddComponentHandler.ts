import { XYPosition } from 'react-flow-renderer';
import {
  EditorApproval,
  EditorEGate,
  EditorEndEvent,
  EditorModel,
  EditorNode,
  EditorProcess,
  EditorSignalEvent,
  EditorSubprocess,
  EditorTimerEvent,
  isEditorData,
} from '../model/editormodel';
import { ModelWrapper } from '../model/modelwrapper';
import { DataType } from '../serialize/interface/baseinterface';
import { capitalizeString, findUniqueID, trydefaultID } from './ModelFunctions';
import { NewComponentTypes } from './constants';
import {
  createApproval,
  createEdge,
  createEGate,
  createEndEvent,
  createProcess,
  createSignalCatchEvent,
  createStartEvent,
  createSubprocess,
  createSubprocessComponent,
  createTimerEvent,
} from './EditorFactory';
import { HistoryItem } from '../model/history';
import { MMELSubprocessComponent } from '../serialize/interface/flowcontrolinterface';

const newComponent: Record<
  NewComponentTypes,
  (model: EditorModel, title?: string) => EditorNode
> = {
  [DataType.PROCESS]: newProcess,
  [DataType.APPROVAL]: newApproval,
  [DataType.ENDEVENT]: newEndEvent,
  [DataType.TIMEREVENT]: newEvent,
  [DataType.SIGNALCATCHEVENT]: newSignalCatch,
  [DataType.EGATE]: newEGate,
};

export function addComponentToModel(
  mw: ModelWrapper,
  type: NewComponentTypes,
  pos: XYPosition,
  title?: string
): EditorModel {
  const model = mw.model;
  const elm = newComponent[type](model, title);
  model.elements[elm.id] = elm;
  const nc = createSubprocessComponent(elm.id);
  nc.x = pos.x;
  nc.y = pos.y;
  const page = model.pages[mw.page];
  page.childs[elm.id] = nc;
  elm.pages.add(mw.page);
  return model;
}

function newProcess(model: EditorModel, title?: string): EditorProcess {
  const id =
    title !== undefined
      ? trydefaultID(capitalizeString(title), model.elements)
      : findUniqueID('Process', model.elements);
  const process = createProcess(id);
  if (title !== undefined) {
    process.name = title;
  }
  return process;
}

function newApproval(model: EditorModel, title?: string): EditorApproval {
  const approval = createApproval(findUniqueID('Approval', model.elements));
  if (title !== undefined) {
    approval.name = title;
  }
  return approval;
}

function newEndEvent(model: EditorModel): EditorEndEvent {
  return createEndEvent(findUniqueID('EndEvent', model.elements));
}

function newEvent(model: EditorModel): EditorTimerEvent {
  return createTimerEvent(findUniqueID('TimerEvent', model.elements));
}

function newSignalCatch(model: EditorModel): EditorSignalEvent {
  return createSignalCatchEvent(
    findUniqueID('SignalCatchEvent', model.elements)
  );
}

function newEGate(model: EditorModel): EditorEGate {
  return createEGate(findUniqueID('EGate', model.elements));
}

export function addEdge(
  page: EditorSubprocess,
  elements: Record<string, EditorNode>,
  source: string,
  target: string
): EditorSubprocess {
  const newPage = { ...page };
  const s = page.childs[source];
  const t = page.childs[target];
  if (s !== undefined && t !== undefined) {
    const selm = elements[s.element];
    const telm = elements[s.element];
    if (isEditorData(selm) || isEditorData(telm)) {
      return newPage;
    }

    const newEdge = createEdge(findUniqueID('Edge', page.edges));
    newEdge.from = source;
    newEdge.to = target;
    newPage.edges = { ...page.edges, [newEdge.id]: newEdge };
  }
  return newPage;
}

export function createNewPage(model: EditorModel): string {
  const start = createStartEvent(findUniqueID('Start', model.elements));
  const page = createSubprocess(findUniqueID('Page', model.pages), start.id);
  start.pages.add(page.id);
  const com = createSubprocessComponent(start.id);
  model.elements[start.id] = start;
  page.childs[start.id] = com;
  model.pages[page.id] = page;
  return page.id;
}

export function addExisingProcessToPage(
  model: EditorModel,
  history: HistoryItem[],
  pageid: string,
  process: string
): EditorModel {
  const page = model.pages[pageid];
  if (page !== undefined) {
    if (page.childs[process] !== undefined) {
      throw new Error(`Process already exists`);
    } else {
      for (const h of history) {
        if (h.pathtext === process) {
          throw new Error(`Cannot include self in subprocess`);
        }
      }
      const newComponent: MMELSubprocessComponent = {
        element: process,
        x: 0,
        y: 0,
        datatype: DataType.SUBPROCESSCOMPONENT,
      };
      const newPage = {
        ...page,
        childs: { ...page.childs, [process]: newComponent },
      };
      return { ...model, pages: { ...model.pages, [pageid]: newPage } };
    }
  } else {
    throw new Error(`Current page not found: ${pageid}`);
  }
}
