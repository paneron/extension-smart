/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { jsx } from '@emotion/react';
import React from 'react';
import { Menu, MenuItem } from '@blueprintjs/core';

const EditorFileMenu: React.FC<{
  undo?: () => void;
  redo?: () => void;
  copy?: () => void;
  paste?: () => void;
}> = function ({ undo, redo, copy, paste }) {
  return (
    <Menu>
      <MenuItem
        text="Undo"
        label="Ctrl + Z"
        disabled={undo === undefined}
        onClick={undo}
      />
      <MenuItem
        text="Redo"
        label="Ctrl + Y"
        disabled={redo === undefined}
        onClick={redo}
      />
      <MenuItem
        text="Mark Process"
        label="Ctrl + C"
        disabled={copy === undefined}
        onClick={copy}
      />
      <MenuItem
        text="Bring in marked"
        label="Ctrl + V"
        disabled={paste === undefined}
        onClick={paste}
      />
    </Menu>
  );
};

export default EditorFileMenu;
