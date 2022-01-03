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
import { ModelAction } from '../model/editor/model';

type Elements = Record<string, EditorNode>;

const newComponent: Record<
  NewComponentTypes,
  (elms: Elements, page: string, title?: string) => EditorNode
> = {
  [DataType.PROCESS]: newProcess,
  [DataType.APPROVAL]: newApproval,
  [DataType.ENDEVENT]: newEndEvent,
  [DataType.TIMEREVENT]: newEvent,
  [DataType.SIGNALCATCHEVENT]: newSignalCatch,
  [DataType.EGATE]: newEGate,
};

export function getaddComponentAction(
  page: string,
  elms: Elements,
  type: NewComponentTypes,
  pos: XYPosition,
  title?: string
): ModelAction {
  const elm = newComponent[type](elms, page, title);
  return {
    type: 'model',
    act: 'pages',
    task: 'new-element',
    value: elm,
    x: pos.x,
    y: pos.y,
    page,
  };
}

function newProcess(
  elms: Elements,
  page: string,
  title?: string
): EditorProcess {
  const id =
    title !== undefined
      ? trydefaultID(capitalizeString(title), elms)
      : findUniqueID('Process', elms);
  const process = createProcess(id);
  process.pages.add(page);
  if (title) {
    process.name = title;
  }
  return process;
}

function newApproval(
  elms: Elements,
  page: string,
  title?: string
): EditorApproval {
  const approval = createApproval(findUniqueID('Approval', elms));
  if (title !== undefined) {
    approval.name = title;
  }
  return approval;
}

function newEndEvent(elms: Elements): EditorEndEvent {
  return createEndEvent(findUniqueID('EndEvent', elms));
}

function newEvent(elms: Elements): EditorTimerEvent {
  return createTimerEvent(findUniqueID('TimerEvent', elms));
}

function newSignalCatch(elms: Elements): EditorSignalEvent {
  return createSignalCatchEvent(findUniqueID('SignalCatchEvent', elms));
}

function newEGate(elms: Elements): EditorEGate {
  return createEGate(findUniqueID('EGate', elms));
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
