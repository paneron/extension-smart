/**
 * This file centralizes the commands generated related to comment components
 */

import { MMELComment } from '@paneron/libmmel/interface/supportinterface';
import { ModelAction } from '../model';

/**
 * Add a new comment to the model
 * @param m the comment object
 * @param pid the process ID where the comment is given on
 * @param parent the comment that this comment replys to. Undefined if this comment is not replying to others
 */
export function addCommentCommand(
  m: MMELComment,
  pid: string,
  parent?: string
) {
  const action: ModelAction = {
    type   : 'model',
    act    : 'comment',
    task   : 'add',
    value  : [m],
    attach : {
      id : pid,
      parent,
    },
  };
  return action;
}

/**
 * Mark the comment as resolved or unresolved
 * @param com the comment to toggle the resolved flag
 */
export function resolveCommentCommand(com: MMELComment) {
  const action: ModelAction = {
    type  : 'model',
    act   : 'comment',
    task  : 'edit',
    id    : com.id,
    value : { ...com, resolved : !com.resolved },
  };
  return action;
}

/**
 * Delete the comment
 * @param cid the comment ID
 * @param pid The process ID where the comment is given on. Not really needed in the action but it needed for undo.
 * @param parent The parent comment ID. Required for undo action. Undefined if it is not replying to other comments
 */
export function deleteCommentCommand(
  cid: string,
  pid: string,
  parent?: string
) {
  const action: ModelAction = {
    type   : 'model',
    act    : 'comment',
    task   : 'delete',
    value  : [cid],
    attach : {
      id : pid,
      parent,
    },
  };
  return action;
}
