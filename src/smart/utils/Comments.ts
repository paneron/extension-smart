import { EditorModel, EditorProcess } from '../model/editormodel';
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

export function modelAddComment(
  model: EditorModel,
  username: string,
  msg: string,
  pid: string,
  parent?: string
): EditorModel {
  const m = { ...model };
  m.comments = { ...m.comments };
  const id = findUniqueID('comment', m.comments);
  const comment: MMELComment = {
    id,
    username,
    message: msg,
    feedback: new Set<string>(),
    resolved: false,
    timestamp: new Date().toLocaleString(),
    datatype: DataType.COMMENT,
  };
  m.comments[id] = comment;
  if (parent) {
    const com = m.comments[parent];
    com.feedback.add(id);
  } else {
    m.elements = { ...m.elements };
    const p = m.elements[pid] as EditorProcess;
    p.comments.add(id);
  }
  return m;
}

export function modelToggleComment(
  model: EditorModel,
  cid: string
): EditorModel {
  const m = { ...model };
  const com = m.comments[cid];
  if (com) {
    const updated: MMELComment = { ...com, resolved: !com.resolved };
    m.comments = { ...m.comments, [cid]: updated };
    return m;
  }
  return model;
}

function deleteComment(comments: Record<string, MMELComment>, cid: string) {
  const comment = comments[cid];
  delete comments[cid];
  comment.feedback.forEach(x => deleteComment(comments, x));
}

export function modelDeleteComment(
  model: EditorModel,
  cid: string,
  pid: string
): EditorModel {
  const m: EditorModel = {
    ...model,
    comments: { ...model.comments },
    elements: { ...model.elements },
  };
  const process = { ...m.elements[pid] } as EditorProcess;
  process.comments = new Set<string>(process.comments);
  process.comments.delete(cid);
  m.elements[process.id] = process;
  deleteComment(m.comments, cid);
  return m;
}

export function materialComments(
  id: string,
  getCommentById: (id: string) => MMELComment | undefined
): CommentInstance | undefined {
  const com = getCommentById(id);
  if (com) {
    const ci: CommentInstance = {
      id: com.id,
      username: com.username,
      message: com.message,
      resolved: com.resolved,
      timestamp: com.timestamp,
      feedback: [...com.feedback]
        .map(x => materialComments(x, getCommentById))
        .filter(x => x)
        .map(x => x as CommentInstance),
    };
    return ci;
  } else {
    return undefined;
  }
}
