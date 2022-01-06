import { EditorDataClass } from '../../editormodel';
import { RegistryCombined } from '../components/element/registry';
import { ModelAction } from '../model';

export function delRegistryCommand(ids: string[]) {
  const action: ModelAction = {
    type: 'model',
    act: 'elements',
    task: 'delete',
    subtask: 'registry',
    value: ids,
  };
  return action;
}

export function addRegistryCommand(reg: RegistryCombined) {
  const action: ModelAction = {
    type: 'model',
    act: 'elements',
    task: 'add',
    subtask: 'registry',
    value: [reg],
  };
  return action;
}

export function editRegistryCommand(id: string, value: RegistryCombined) {
  const action: ModelAction = {
    type: 'model',
    act: 'elements',
    task: 'edit',
    subtask: 'registry',
    id,
    value,
  };
  return action;
}

export function delDCCommand(ids: string[]) {
  const action: ModelAction = {
    type: 'model',
    act: 'elements',
    task: 'delete',
    subtask: 'dc',
    value: ids,
  };
  return action;
}

export function addDCCommand(dc: EditorDataClass) {
  const action: ModelAction = {
    type: 'model',
    act: 'elements',
    task: 'add',
    subtask: 'dc',
    value: [dc],
  };
  return action;
}

export function editDCCommand(id: string, value: EditorDataClass) {
  const action: ModelAction = {
    type: 'model',
    act: 'elements',
    task: 'edit',
    subtask: 'dc',
    id,
    value,
  };
  return action;
}
