import React from 'react';
import { IconName, Menu, MenuItem } from '@blueprintjs/core';
import { EditorViewOption } from '../../model/States';

const items: (keyof EditorViewOption)[] = [
  'dvisible',
  'idVisible',
  'edgeDeleteVisible',
  'commentVisible',
];

const ItemNames: Record<keyof EditorViewOption, string> = {
  dvisible          : 'Show Data',
  idVisible         : 'Show ID',
  edgeDeleteVisible : 'Show Edge Remove',
  commentVisible    : 'Show Comment',
};

const EditorViewMenu: React.FC<{
  viewOption: EditorViewOption;
  setViewOption: (x: EditorViewOption) => void;
}> = function ({ viewOption, setViewOption }) {
  function toggleVisibility(x: keyof EditorViewOption) {
    setViewOption({ ...viewOption, [x] : !viewOption[x] });
  }

  return (
    <Menu>
      {items.map(x => (
        <MenuItem
          key={x}
          text={ItemNames[x]}
          onClick={() => toggleVisibility(x)}
          icon={getVisibilityIconName(viewOption[x])}
        />
      ))}
    </Menu>
  );
};

function getVisibilityIconName(isVisible: boolean): IconName {
  return isVisible ? 'tick' : 'blank';
}

export default EditorViewMenu;
