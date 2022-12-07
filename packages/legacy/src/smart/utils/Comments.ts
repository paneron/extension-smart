import { DataType } from '../serialize/interface/baseinterface';
import { MMELComment } from '../serialize/interface/supportinterface';
import { findUniqueID } from './ModelFunctions';

export type CommentInstance = {
  id: string;
  username: string;
  message: string;
  timestamp: string;
  feedback: CommentInstance[];
  resolved: boolean;
};

export function createNewComment(
  comments: Record<string, MMELComment>,
  username: string,
  message: string
): MMELComment {
  return {
    id        : findUniqueID('comment', comments),
    username,
    message,
    feedback  : new Set<string>(),
    resolved  : false,
    timestamp : new Date().toLocaleDateString(),
    datatype  : DataType.COMMENT,
  };
}

export function materialComments(
  id: string,
  getCommentById: (id: string) => MMELComment | undefined
): CommentInstance | undefined {
  const com = getCommentById(id);
  if (com) {
    const ci: CommentInstance = {
      id        : com.id,
      username  : com.username,
      message   : com.message,
      resolved  : com.resolved,
      timestamp : com.timestamp,
      feedback  : [...com.feedback]
        .map(x => materialComments(x, getCommentById))
        .filter(x => x)
        .map(x => x as CommentInstance),
    };
    return ci;
  } else {
    return undefined;
  }
}
