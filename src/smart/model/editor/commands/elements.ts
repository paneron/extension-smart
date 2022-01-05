import { MMELEdge } from '../../../serialize/interface/flowcontrolinterface';
import { EditorEGate, EditorNode } from '../../editormodel';
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
    act: 'hybird-edit',
    task: 'egate-edit',
    id,
    page,
    update,
    edges,
  };
  return action;
}
