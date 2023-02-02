/**
 * This file centralizes the commands generated related to registry and data class
 */

import { MMELReference } from '@paneron/libmmel/interface/supportinterface';
import { EditorDataClass } from '../../editormodel';
import { RegistryCombined } from '../components/element/registry';
import { ModelAction } from '../model';

/**
 * Delete the registries from the model
 * @param ids an array of registry IDs
 */
export function delRegistryCommand(ids: string[]) {
  const action: ModelAction = {
    type    : 'model',
    act     : 'elements',
    task    : 'delete',
    subtask : 'registry',
    value   : ids,
  };
  return action;
}

/**
 * Add the registries to the model
 * @param reg an array of Registry objects to be added to the model
 */
export function addRegistryCommand(reg: RegistryCombined) {
  const action: ModelAction = {
    type    : 'model',
    act     : 'elements',
    task    : 'add',
    subtask : 'registry',
    value   : [reg],
  };
  return action;
}

/**
 * Edit the registry
 * @param id the registry ID
 * @param value the updated content of the Registry object
 */
export function editRegistryCommand(id: string, value: RegistryCombined) {
  const action: ModelAction = {
    type    : 'model',
    act     : 'elements',
    task    : 'edit',
    subtask : 'registry',
    id,
    value,
  };
  return action;
}

/**
 * Add a new attribute to the registry. New reference may be created here.
 * @param id The ID of the Registry
 * @param value The updated contents of the Registry
 * @param refs The new references to be added to the model
 */
export function editImportRegistryCommand(
  id: string,
  value: RegistryCombined,
  refs: MMELReference[]
): ModelAction {
  const action: ModelAction = {
    type    : 'model',
    act     : 'hybird',
    task    : 'registry-import-ref',
    id,
    value,
    newRefs : refs,
    delRefs : [],
  };
  return action;
}

/**
 * Delete data classes from the model
 * @param ids an array of IDs of data classes
 */
export function delDCCommand(ids: string[]) {
  const action: ModelAction = {
    type    : 'model',
    act     : 'elements',
    task    : 'delete',
    subtask : 'dc',
    value   : ids,
  };
  return action;
}

/**
 * Add new data classes to the model
 * @param dc the new data class object
 */
export function addDCCommand(dc: EditorDataClass) {
  const action: ModelAction = {
    type    : 'model',
    act     : 'elements',
    task    : 'add',
    subtask : 'dc',
    value   : [dc],
  };
  return action;
}

/**
 * Edit the contents of the data class
 * @param id The ID of the data class object
 * @param value The updated content of the data class object
 */
export function editDCCommand(id: string, value: EditorDataClass) {
  const action: ModelAction = {
    type    : 'model',
    act     : 'elements',
    task    : 'edit',
    subtask : 'dc',
    id,
    value,
  };
  return action;
}

/**
 * Add a new attribute to the data class. May add new references
 * @param id The ID of the data class
 * @param value The updated content of the data class
 * @param refs The new reference to be added to the model
 * @returns
 */
export function editImportDCCommand(
  id: string,
  value: EditorDataClass,
  refs: MMELReference[]
): ModelAction {
  const action: ModelAction = {
    type    : 'model',
    act     : 'hybird',
    task    : 'dc-import-ref',
    id,
    value,
    newRefs : refs,
    delRefs : [],
  };
  return action;
}
