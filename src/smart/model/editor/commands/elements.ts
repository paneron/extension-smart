import { MMELEdge } from '../../../serialize/interface/flowcontrolinterface';
import {
  MMELLink,
  MMELNote,
  MMELProvision,
} from '../../../serialize/interface/supportinterface';
import { EditorEGate, EditorNode, EditorProcess } from '../../editormodel';
import { ModelAction } from '../model';

export function editElmCommand(id: string, value: EditorNode) {
  const action: ModelAction = {
    type: 'model',
    act: 'elements',
    task: 'edit',
    subtask: 'flowunit',
    id,
    value,
  };
  return action;
}

export function editEGateCommand(
  id: string,
  page: string,
  update: EditorEGate,
  edges: MMELEdge[]
) {
  const action: ModelAction = {
    type: 'model',
    act: 'hybird',
    task: 'egate-edit',
    id,
    page,
    update,
    edges,
  };
  return action;
}

export function createSubprocessCommand(id: string) {
  const action: ModelAction = {
    type: 'model',
    act: 'hybird',
    task: 'process-add-page',
    id,
  };
  return action;
}

export function editProcessCommand(
  id: string,
  process: EditorProcess,
  provisions: MMELProvision[],
  notes: MMELNote[],
  links: MMELLink[]
) {
  const newProcess: EditorProcess = {
    ...process,
    provision: new Set(provisions.map(x => x.id)),
    links: new Set(links.map(x => x.id)),
    notes: new Set(notes.map(x => x.id)),
  };
  const action: ModelAction = {
    type: 'model',
    act: 'hybird',
    task: 'process-edit',
    id,
    process: newProcess,
    provisions,
    notes,
    links,
  };
  return action;
}
