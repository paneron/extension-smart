import { Logger } from '../../../utils/ModelFunctions';
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
  Logger.log('Command:', action);
  Logger.log(value);
  return action;
}
