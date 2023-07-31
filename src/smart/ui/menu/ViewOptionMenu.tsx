import React from 'react';
import { IconName, Menu, MenuItem } from '@blueprintjs/core';
import { ViewerOption } from '@/smart/model/States';

const items: (keyof ViewerOption)[] = [
  'dvisible',
  'idVisible',
  'repoBCVisible',
];

const ItemNames: Record<keyof ViewerOption, string> = {
  dvisible      : 'Show Data',
  idVisible     : 'Show ID',
  repoBCVisible : 'Show Repo breadcrumb',
};

const ViewOptionMenu: React.FC<{
  viewOption: ViewerOption;
  setViewOption: (x: ViewerOption) => void;
}> = function ({ viewOption, setViewOption }) {
  function toggleVisibility(x: keyof ViewerOption) {
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

export default ViewOptionMenu;
