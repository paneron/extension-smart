import { MMELComment } from '@paneron/libmmel/interface/supportinterface';
import { EditorNode, EditorProcess } from '../../editormodel';
import { UndoReducerInterface } from '../interface';
import { ModelAction } from '../model';
import { ItemAction, useItems } from './itemTemplate';

type command = 'comment';
type ownType = MMELComment;
const value = 'comment';

export type CommentAction = ItemAction<ownType, command> & {
  attach?: {
    id: string;
    parent?: string;
  };
  cascade?: ModelAction[];
};

export function useComment(
  x: Record<string, ownType>
): UndoReducerInterface<Record<string, ownType>, CommentAction> {
  const [comments, actComment, init] = useItems<ownType, command>(x, value);

  function act(action: CommentAction): CommentAction | undefined {
    const reverse = actComment(action);
    if (reverse) {
      const commentReverse: CommentAction = {
        ...reverse,
        attach : action.attach,
      };
      return commentReverse;
    }
    return undefined;
  }

  return [comments, act, init];
}

export function cascadeCheckComment(
  elms: Record<string, EditorNode>,
  comments: Record<string, MMELComment>,
  action: CommentAction
): ModelAction[] | undefined {
  if (action.cascade) {
    return undefined;
  }
  if (action.task === 'add') {
    if (action.attach) {
      const { id, parent } = action.attach;
      if (parent) {
        const com = comments[parent];
        const newComment = { ...com };
        newComment.feedback = new Set([...newComment.feedback]);
        for (const v of action.value) {
          newComment.feedback.add(v.id);
        }
        action.cascade = [
          {
            type  : 'model',
            act   : 'comment',
            task  : 'edit',
            id    : parent,
            value : newComment,
          },
        ];
        return [
          {
            type  : 'model',
            act   : 'comment',
            task  : 'edit',
            id    : parent,
            value : com,
          },
        ];
      } else {
        const process = elms[id];
        const newProcess = { ...process } as EditorProcess;
        newProcess.comments = new Set([...newProcess.comments]);
        for (const v of action.value) {
          newProcess.comments.add(v.id);
        }
        action.cascade = [
          {
            type    : 'model',
            act     : 'elements',
            task    : 'edit',
            subtask : 'flowunit',
            id,
            value   : newProcess,
          },
        ];
        return [
          {
            type    : 'model',
            act     : 'elements',
            task    : 'edit',
            subtask : 'flowunit',
            id,
            value   : process,
          },
        ];
      }
    }
  } else if (action.task === 'delete') {
    const fbs = action.value.flatMap(x =>
      findAllFeedBack(comments, comments[x])
    );
    const all = fbs.map(x => comments[x]);
    const deleteAction: ModelAction = {
      type  : 'model',
      act   : 'comment',
      task  : 'delete',
      value : fbs,
    };
    const undoAction: ModelAction = {
      type  : 'model',
      act   : 'comment',
      task  : 'add',
      value : all,
    };
    if (action.attach) {
      const { id, parent } = action.attach;
      if (parent) {
        const com = comments[parent];
        const newComment = { ...com };
        newComment.feedback = new Set([...newComment.feedback]);
        for (const v of action.value) {
          newComment.feedback.delete(v);
        }
        action.cascade = [
          {
            type  : 'model',
            act   : 'comment',
            task  : 'edit',
            id    : parent,
            value : newComment,
          },
          deleteAction,
        ];
        return [
          {
            type  : 'model',
            act   : 'comment',
            task  : 'edit',
            id    : parent,
            value : com,
          },
          undoAction,
        ];
      } else {
        const process = elms[id];
        const newProcess = { ...process } as EditorProcess;
        newProcess.comments = new Set([...newProcess.comments]);
        for (const v of action.value) {
          newProcess.comments.delete(v);
        }
        action.cascade = [
          {
            type    : 'model',
            act     : 'elements',
            task    : 'edit',
            subtask : 'flowunit',
            id,
            value   : newProcess,
          },
          deleteAction,
        ];
        return [
          {
            type    : 'model',
            act     : 'elements',
            task    : 'edit',
            subtask : 'flowunit',
            id,
            value   : process,
          },
          undoAction,
        ];
      }
    }
  }
  return [];
}

function findAllFeedBack(
  comments: Record<string, MMELComment>,
  x: MMELComment
): string[] {
  const fb = [...x.feedback];
  const ret = fb.flatMap(y => findAllFeedBack(comments, comments[y]));
  return [...fb, ...ret];
}
