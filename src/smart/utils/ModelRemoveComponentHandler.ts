import { ModelAction } from '../model/editor/model';
import {
  EditorModel,
  EditorProcess,
  EditorSubprocess,
  isEditorProcess,
} from '../model/editormodel';
import { DataType } from '../serialize/interface/baseinterface';
import { DeletableNodeTypes } from './constants';

function deleteProcess_deprecated(model: EditorModel, pageid: string, id: string) {
  const page = model.pages[pageid];
  delete page.childs[id];
  deleteRelatedEdges(page, id);
  const process = model.elements[id] as EditorProcess;
  const newPages = new Set(process.pages);
  newPages.delete(pageid);
  process.pages = newPages;
  if (process.pages.size === 0) {
    delete model.elements[id];
    for (const provision of process.provision) {
      delete model.provisions[provision];
    }
    if (process.page !== '') {
      deletePage(model, process.page);
    }
  }
  return model;
}

export function deletePage(model: EditorModel, pageid: string) {
  const page = model.pages[pageid];
  for (const c in page.childs) {
    const child = page.childs[c];
    const elm = model.elements[child.element];
    if (isEditorProcess(elm)) {
      deleteProcess_deprecated(model, pageid, elm.id);
    } else {
      delete model.elements[elm.id];
    }
    delete page.childs[c];
  }
  delete model.pages[pageid];
}

function deleteNode_deprecated(model: EditorModel, pageid: string, id: string) {
  const page = { ...model.pages[pageid] };
  delete page.childs[id];
  model.pages[pageid] = page;
  deleteRelatedEdges(page, id);
  delete model.elements[id];
  return model;
}

export function deleteNodeAction(model: EditorModel, pageid: string, id: string): ModelAction {
  const action:ModelAction = {
    type: 'model',
    act: 'pages',
    task: 'delete-element',
    value: model.elements[id],
    page: pageid    
  }
  return action;
}

function deleteRelatedEdges(page: EditorSubprocess, id: string) {
  for (const e in page.edges) {
    const edge = page.edges[e];
    if (edge.from === id || edge.to === id) {
      delete page.edges[e];
    }
  }
}

export const DeleteAction_deprecated: Record<
  DeletableNodeTypes,
  (model: EditorModel, pageid: string, id: string) => EditorModel
> = {
  [DataType.PROCESS]: deleteProcess_deprecated,
  [DataType.APPROVAL]: deleteNode_deprecated,
  [DataType.TIMEREVENT]: deleteNode_deprecated,
  [DataType.SIGNALCATCHEVENT]: deleteNode_deprecated,
  [DataType.EGATE]: deleteNode_deprecated,
  [DataType.ENDEVENT]: deleteNode_deprecated,
};

export const DeleteConfirmMessgae: Record<DeletableNodeTypes, string> = {
  [DataType.PROCESS]: 'Confirm deleting the process?',
  [DataType.APPROVAL]: 'Confirm deleting the approval process?',
  [DataType.TIMEREVENT]: 'Confirm deleting the timer event?',
  [DataType.SIGNALCATCHEVENT]: 'Confirm deleting the signal catch event?',
  [DataType.EGATE]: 'Confirm deleting the gateway?',
  [DataType.ENDEVENT]: 'Confirm deleting the end event?',
};
