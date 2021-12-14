import { Menu, MenuItem } from '@blueprintjs/core';

import React from 'react';

const RepoAIMenu: React.FC<{
  requireAI: () => void;
}> = function ({ requireAI }) {
  return (
    <Menu>
      <MenuItem text="From SMART document" onClick={requireAI} />
    </Menu>
  );
};

export default RepoAIMenu;
