/**
 * This file centralizes the commands related to node elements
 */

import { MMELEdge } from '@paneron/libmmel/interface/flowcontrolinterface';
import {
  MMELLink,
  MMELNote,
  MMELProvision,
  MMELReference,
} from '@paneron/libmmel/interface/supportinterface';
import {
  EditorEGate,
  EditorModel,
  EditorNode,
  EditorProcess,
  isEditorProcess,
} from '../../editormodel';
import { ModelAction } from '@/smart/model/editor/model';

/**
 * Edit the node elements. It can include gateway, approval, process, timer / signal events.
 * However, some components are more complex and should use the other commands for updating.
 * @param id ID of the element
 * @param value the updated content of the element
 */
export function editElmCommand(id: string, value: EditorNode) {
  const action: ModelAction = {
    type    : 'model',
    act     : 'elements',
    task    : 'edit',
    subtask : 'flowunit',
    id,
    value,
  };
  return action;
}

/**
 * Edit gateway
 * @param id The ID of the gateway element
 * @param page The page to be updated (because we need to edit the edges too)
 * @param update The updated content of the gateway
 * @param edges The updated edges
 */
export function editEGateCommand(
  id: string,
  page: string,
  update: EditorEGate,
  edges: MMELEdge[]
): ModelAction {
  const action: ModelAction = {
    type : 'model',
    act  : 'hybird',
    task : 'egate-edit',
    id,
    page,
    update,
    edges,
  };
  return action;
}

/**
 * Add a subprocess page to the process
 * @param id The Process ID
 */
export function createSubprocessCommand(id: string): ModelAction {
  const action: ModelAction = {
    type : 'model',
    act  : 'hybird',
    task : 'process-add-page',
    id,
  };
  return action;
}

/**
 * Remove the subprocess page from the process
 * @param id The Process ID
 */
export function deleteSubprocessCommand(id: string): ModelAction {
  const action: ModelAction = {
    type : 'model',
    act  : 'hybird',
    task : 'process-remove-page',
    id,
  };
  return action;
}

/**
 * A process can appear multiple times on different pages. If the removal of the process is not the last copy of the process, it is a bring out process.
 * @param id The process ID
 * @param page The page where the process is removed
 */
export function bringoutProcessCommand(id: string, page: string): ModelAction {
  const action: ModelAction = {
    type : 'model',
    act  : 'hybird',
    task : 'process-bringout',
    id,
    page,
  };
  return action;
}

/**
 * Edit the contents of a process
 * @param id The process ID
 * @param process The updated content of the process
 * @param provisions The updated provision statements
 * @param notes The updated notes statements
 * @param links The updated links
 * @param refs The new references (due to importing from selected text of a reference document)
 */
export function editProcessCommand(
  id: string,
  process: EditorProcess,
  provisions: MMELProvision[],
  notes: MMELNote[],
  links: MMELLink[],
  refs: MMELReference[]
): ModelAction {
  const newProcess: EditorProcess = {
    ...process,
    provision : new Set(provisions.map(x => x.id)),
    links     : new Set(links.map(x => x.id)),
    notes     : new Set(notes.map(x => x.id)),
  };
  const action: ModelAction = {
    type    : 'model',
    act     : 'hybird',
    task    : 'process-edit',
    id,
    process : newProcess,
    provisions,
    notes,
    links,
    newRefs : refs,
    delRefs : [],
  };
  return action;
}

/**
 * Delete the process element
 * Note that it means it is the last copy of the process. Otherwise, the bring out command should be used.
 * @param model Just pass the existing model to the function
 * @param pageid The page where the process is located.
 * @param id The Process ID
 */
export function deleteNodeAction(
  model: EditorModel,
  pageid: string,
  id: string
): ModelAction {
  const elm = model.elements[id];
  if (isEditorProcess(elm)) {
    const action: ModelAction = {
      type : 'model',
      act  : 'hybird',
      task : 'process-delete',
      id   : elm.id,
      page : pageid,
    };
    return action;
  }
  const action: ModelAction = {
    type  : 'model',
    act   : 'pages',
    task  : 'delete-element',
    value : elm,
    page  : pageid,
  };
  return action;
}
