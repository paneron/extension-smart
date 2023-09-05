import React from 'react';
import type { IconName } from '@blueprintjs/core';
import { Menu, MenuItem } from '@blueprintjs/core';
import { FunctionPage, FuntionNames } from '@/smart/ui/mainviewer';

const ViewToolMenu: React.FC<{
  funPage: FunctionPage;
  setFunPage: (fp: FunctionPage) => void;
}> = function ({ funPage, setFunPage }) {
  return (
    <Menu>
      {Object.values(FunctionPage).map(x => (
        <MenuItem
          key={x}
          text={FuntionNames[x]}
          onClick={() => setFunPage(x)}
          icon={getVisibilityIconName(funPage === x)}
        />
      ))}
    </Menu>
  );
};

function getVisibilityIconName(isVisible: boolean): IconName {
  return isVisible ? 'tick' : 'blank';
}

export default ViewToolMenu;
