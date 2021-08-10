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
import { findUniqueID } from './commonfunctions';
import { NewComponentTypes } from './constants';
import {
  createApproval,
  createEdge,
  createEGate,
  createEndEvent,
  createProcess,
  createSignalCatchEvent,
  createSubprocessComponent,
  createTimerEvent,
} from './EditorFactory';

const newComponent: Record<
  NewComponentTypes,
  (model: EditorModel) => EditorNode
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
  pos: XYPosition
): EditorModel {
  const model = mw.model;
  const elm = newComponent[type](model);
  model.elements[elm.id] = elm;
  const nc = createSubprocessComponent(elm.id);
  nc.x = pos.x;
  nc.y = pos.y;
  const page = model.pages[mw.page];
  page.childs[elm.id] = nc;
  elm.pages.add(mw.page);
  return model;
}

function newProcess(model: EditorModel): EditorProcess {
  return createProcess(findUniqueID('Process', model.elements));
}

function newApproval(model: EditorModel): EditorApproval {
  return createApproval(findUniqueID('Approval', model.elements));
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
  const s = page.childs[source];
  const t = page.childs[target];
  if (s !== undefined && t !== undefined) {
    const selm = elements[s.element];
    const telm = elements[s.element];
    if (isEditorData(selm) || isEditorData(telm)) {
      return page;
    }
    const newEdge = createEdge(findUniqueID('Edge', page.edges));
    newEdge.from = source;
    newEdge.to = target;
    page.edges[newEdge.id] = newEdge;
  }
  return page;
}
