import { Button, ButtonGroup, Switch } from '@blueprintjs/core';
import React from 'react';
import { CommentInstance } from '../../utils/Comments';
import CommentField from './CommentField';

const CommentEntry: React.FC<{
  comment: CommentInstance;
  addComment: (msg: string, parent?: string) => void;
  deleteComment: (cid: string, parent?: string) => void;
  toggleCommentResolved?: (cid: string) => void;
  parent?: string;
}> = function ({
  comment,
  addComment,
  toggleCommentResolved,
  deleteComment,
  parent,
}) {
  function onComment(msg: string) {
    addComment(msg, comment.id);
  }

  return (
    <fieldset>
      <legend>
        {comment.username} ({comment.timestamp}):
      </legend>
      {toggleCommentResolved ? (
        <Toggle
          value={comment.resolved}
          onClick={() => toggleCommentResolved(comment.id)}
        />
      ) : (
        <></>
      )}
      <p>{comment.message}</p>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <ButtonGroup>
          <CommentField title="Reply" onComment={onComment} />
          <Button
            intent="danger"
            onClick={() => deleteComment(comment.id, parent)}
          >
            Delete
          </Button>
        </ButtonGroup>
      </div>
      {comment.feedback.map(x => (
        <CommentEntry
          comment={x}
          addComment={addComment}
          deleteComment={deleteComment}
          parent={comment.id}
        />
      ))}
    </fieldset>
  );
};

const Toggle: React.FC<{
  value: boolean;
  onClick: () => void;
}> = function ({ value, onClick }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
      <Switch checked={value} onChange={onClick}>
        Resolved
      </Switch>
    </div>
  );
};

export default CommentEntry;
