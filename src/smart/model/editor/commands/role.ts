import { MMELRole } from '../../../serialize/interface/supportinterface';
import { ModelAction } from '../model';

export function addRoleCommand(role: MMELRole) {
  const action: ModelAction = {
    type: 'model',
    act: 'roles',
    task: 'add',
    value: [role],
  };
  return action;
}

export function deleteRoleCommand(ids: string[]) {
  const action: ModelAction = {
    type: 'model',
    act: 'roles',
    task: 'delete',
    value: ids,
  };
  return action;
}

export function editRoleCommand(id: string, value: MMELRole) {
  const action: ModelAction = {
    type: 'model',
    act: 'roles',
    task: 'edit',
    id,
    value,
  };
  return action;
}
