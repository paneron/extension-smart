/**
 * This file centralizes the commands related to reference
 */

import { MMELReference } from '@paneron/libmmel/interface/supportinterface';
import { ModelAction } from '@/smart/model/editor/model';

/**
 * Delete references
 * @param ids The array of reference IDs
 */
export function delRefCommand(ids: string[]) {
  const action: ModelAction = {
    type  : 'model',
    act   : 'refs',
    task  : 'delete',
    value : ids,
  };
  return action;
}

/**
 * Add references
 * @param value The array of reference objects
 */
export function addRefCommand(value: MMELReference[]) {
  const action: ModelAction = {
    type : 'model',
    act  : 'refs',
    task : 'add',
    value,
  };
  return action;
}

/**
 * Edit the content of a reference
 * @param id The ID of the reference to be edited
 * @param value The updated content of the reference object
 */
export function editRefCommand(id: string, value: MMELReference) {
  const action: ModelAction = {
    type : 'model',
    act  : 'refs',
    task : 'edit',
    id,
    value,
  };
  return action;
}
