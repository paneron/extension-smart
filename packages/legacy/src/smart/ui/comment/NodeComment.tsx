import { Button } from '@blueprintjs/core';
import { Popover2, Tooltip2 } from '@blueprintjs/popover2';
import React from 'react';
import { MMELComment } from '../../serialize/interface/supportinterface';
import { CommentInstance, materialComments } from '../../utils/Comments';
import CommentContainer from './CommentContainer';

const NodeComment: React.FC<{
  cids: Set<string>;
  getCommentById: (id: string) => MMELComment | undefined;
  addComment: (msg: string, parent?: string) => void;
  deleteComment: (cid: string, parent?: string) => void;
  toggleCommentResolved: (cid: string) => void;
}> = function ({
  cids,
  getCommentById,
  addComment,
  toggleCommentResolved,
  deleteComment,
}) {
  const comments = [...cids]
    .map(x => materialComments(x, getCommentById))
    .filter(x => x)
    .map(x => x as CommentInstance);
  const hasUnresolved = comments.reduce((b, x) => b || !x.resolved, false);
  return (
    <div
      style={{
        position : 'fixed',
        left     : -10,
        top      : -10,
      }}
    >
      <Popover2
        content={
          <CommentContainer
            comments={comments}
            addComment={addComment}
            deleteComment={deleteComment}
            toggleCommentResolved={toggleCommentResolved}
          />
        }
      >
        <Tooltip2 content="Add / View comments" position="top">
          <Button
            small
            icon="comment"
            intent={
              hasUnresolved
                ? 'danger'
                : comments.length > 0
                ? 'primary'
                : 'none'
            }
          />
        </Tooltip2>
      </Popover2>
    </div>
  );
};

export default NodeComment;
