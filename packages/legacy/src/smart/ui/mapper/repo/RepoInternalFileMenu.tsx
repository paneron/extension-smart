import { Menu, MenuItem } from '@blueprintjs/core';
import React from 'react';
import { RepoItemType } from '../../../model/repo';

const RepoInternalFileMenu: React.FC<{
  setType: (x: RepoItemType) => void;
}> = function ({ setType }) {
  return (
    <Menu>
      <MenuItem text="Open reference model" onClick={() => setType('Ref')} />
      <MenuItem
        text="Open implementation model"
        onClick={() => setType('Imp')}
      />
      <MenuItem text="Open document" onClick={() => setType('Doc')} />
    </Menu>
  );
};

export default RepoInternalFileMenu;
