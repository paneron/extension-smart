import { MMELComment } from '../../../serialize/interface/supportinterface';
import { ModelAction } from '../model';

export function addCommentCommand(
  m: MMELComment,
  pid: string,
  parent?: string
) {
  const action: ModelAction = {
    type: 'model',
    act: 'comment',
    task: 'add',
    value: [m],
    attach: {
      id: pid,
      parent,
    },
  };
  return action;
}

export function resolveCommentCommand(com: MMELComment) {
  const action: ModelAction = {
    type: 'model',
    act: 'comment',
    task: 'edit',
    id: com.id,
    value: { ...com, resolved: !com.resolved },
  };
  return action;
}

export function deleteCommentCommand(
  cid: string,
  pid: string,
  parent?: string
) {
  const action: ModelAction = {
    type: 'model',
    act: 'comment',
    task: 'delete',
    value: [cid],
    attach: {
      id: pid,
      parent,
    },
  };
  return action;
}
