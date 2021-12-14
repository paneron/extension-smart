import { Button } from '@blueprintjs/core';
import { Popover2 } from '@blueprintjs/popover2';
import React from 'react';
import { useState } from 'react';
import AskForComment from './AskForComment';

const CommentField: React.FC<{
  title: string;
  onComment: (msg: string) => void;
}> = function (props) {
  const { title, onComment } = props;
  const [isOpen, setIsOpen] = useState<boolean>(false);

  function onSubmit(msg: string) {
    onComment(msg);
    setIsOpen(false);
  }

  return (
    <Popover2
      minimal
      placement="bottom-start"
      isOpen={isOpen}
      content={
        <AskForComment onSubmit={onSubmit} onCancel={() => setIsOpen(false)} />
      }
      onClose={() => setIsOpen(false)}
    >
      <Button onClick={() => setIsOpen(!isOpen)}>{title}</Button>
    </Popover2>
  );
};

export default CommentField;
