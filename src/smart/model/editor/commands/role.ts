/**
 * This file centralizes the commands related to roles
 */

import type { MMELRole } from '@paneron/libmmel/interface/supportinterface';
import type { ModelAction } from '@/smart/model/editor/model';

/**
 * Add role
 * @param role The new role object
 */
export function addRoleCommand(role: MMELRole) {
  const action: ModelAction = {
    type  : 'model',
    act   : 'roles',
    task  : 'add',
    value : [role],
  };
  return action;
}

/**
 * Delete a role
 * @param ids An array of role IDs
 */
export function deleteRoleCommand(ids: string[]) {
  const action: ModelAction = {
    type  : 'model',
    act   : 'roles',
    task  : 'delete',
    value : ids,
  };
  return action;
}

/**
 * Edit a role object
 * @param id The ID of the role object
 * @param value The updated role object
 */
export function editRoleCommand(id: string, value: MMELRole) {
  const action: ModelAction = {
    type : 'model',
    act  : 'roles',
    task : 'edit',
    id,
    value,
  };
  return action;
}
