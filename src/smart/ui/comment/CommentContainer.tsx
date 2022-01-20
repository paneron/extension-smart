import React from 'react';
import { popoverPanelContainer } from '../../../css/layout';
import { CommentInstance } from '../../utils/Comments';
import CommentEntry from './CommentEntry';
import CommentField from './CommentField';

const CommentContainer: React.FC<{
  comments: CommentInstance[];
  addComment: (msg: string, parent?: string) => void;
  deleteComment: (cid: string, parent?: string) => void;
  toggleCommentResolved: (cid: string) => void;
}> = function ({ comments, addComment, toggleCommentResolved, deleteComment }) {
  function onComment(msg: string) {
    addComment(msg);
  }

  return (
    <div style={popoverPanelContainer}>
      {comments.map(c => (
        <CommentEntry
          comment={c}
          addComment={addComment}
          deleteComment={deleteComment}
          toggleCommentResolved={toggleCommentResolved}
        />
      ))}
      <CommentField title="Add comment" onComment={onComment} />
    </div>
  );
};

export default CommentContainer;
