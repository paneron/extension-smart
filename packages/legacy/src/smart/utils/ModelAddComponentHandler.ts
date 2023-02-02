import { XYPosition } from 'react-flow-renderer';
import {
  EditorApproval,
  EditorEGate,
  EditorEndEvent,
  EditorModel,
  EditorNode,
  EditorProcess,
  EditorSignalEvent,
  EditorStartEvent,
  EditorSubprocess,
  EditorTimerEvent,
} from '../model/editormodel';
import { DataType } from '@paneron/libmmel/interface/baseinterface';
import { capitalizeString, findUniqueID, trydefaultID } from './ModelFunctions';
import { NewComponentTypes } from './constants';
import {
  createApproval,
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
import { ModelAction } from '../model/editor/model';

type Elements = Record<string, EditorNode>;

const newComponent: Record<
  NewComponentTypes,
  (elms: Elements, page: string, title?: string) => EditorNode
> = {
  [DataType.PROCESS]          : newProcess,
  [DataType.APPROVAL]         : newApproval,
  [DataType.ENDEVENT]         : newEndEvent,
  [DataType.TIMEREVENT]       : newEvent,
  [DataType.SIGNALCATCHEVENT] : newSignalCatch,
  [DataType.EGATE]            : newEGate,
};

export function getAddComponentAction(
  page: string,
  elms: Elements,
  type: NewComponentTypes,
  pos: XYPosition,
  title?: string
): ModelAction {
  const elm = newComponent[type](elms, page, title);
  return {
    type  : 'model',
    act   : 'pages',
    task  : 'new-element',
    value : elm,
    x     : pos.x,
    y     : pos.y,
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

export function createNewPage(
  model: EditorModel
): [EditorSubprocess, EditorStartEvent] {
  const start = createStartEvent(findUniqueID('Start', model.elements));
  const page = createSubprocess(findUniqueID('Page', model.pages), start.id);
  const com = createSubprocessComponent(start.id);
  page.childs[start.id] = com;
  return [page, start];
}

export function addExisingProcessToPage(
  model: EditorModel,
  history: HistoryItem[],
  pageid: string,
  process: string,
  act: (x: ModelAction) => void
) {
  const page = model.pages[pageid];
  if (page) {
    if (page.childs[process]) {
      throw new Error('Process already exists');
    } else {
      for (const h of history) {
        if (h.pathtext === process) {
          throw new Error('Cannot include self in subprocess');
        }
      }
      const action: ModelAction = {
        type : 'model',
        act  : 'hybird',
        task : 'process-bringin',
        id   : process,
        page : pageid,
      };
      act(action);
    }
  } else {
    throw new Error(`Current page not found: ${pageid}`);
  }
}
