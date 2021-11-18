import { Button } from '@blueprintjs/core';
import { Popover2 } from '@blueprintjs/popover2';
import React from 'react';

const MenuButton: React.FC<{
  content: JSX.Element;
  text: string;
}> = function ({ content, text }) {
  return (
    <Popover2 minimal placement="bottom-start" content={content}>
      <Button> {text} </Button>
    </Popover2>
  );
};

export default MenuButton;
