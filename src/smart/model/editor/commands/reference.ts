import { MMELReference } from "../../../serialize/interface/supportinterface";
import { ModelAction } from "../model";

export function delRefCommand(ids: string[]) {
  const action: ModelAction = {
    type: 'model',
    act: 'refs',
    task: 'delete',
    value: ids,
  };
  return action;
}

export function addRefCommand(value: MMELReference[]) {
  const action: ModelAction = {
    type: 'model',
    act: 'refs',
    task: 'add',
    value,
  };
  return action;
}

export function editRefCommand(id: string, value: MMELReference){
  const action: ModelAction = {
    type: 'model',
    act: 'refs',
    task: 'edit',
    id,
    value,
  };
  return action;
}