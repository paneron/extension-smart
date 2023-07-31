import React from 'react';
import { popoverPanelContainer } from '@/css/layout';
import { CommentInstance } from '@/smart/utils/Comments';
import CommentEntry from '@/smart/ui/comment/CommentEntry';
import CommentField from '@/smart/ui/comment/CommentField';

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
          key={c.id}
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
