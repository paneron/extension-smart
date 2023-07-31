import { Menu, MenuItem } from '@blueprintjs/core';
import React from 'react';
import MenuButton from '@/smart/ui/menu/MenuButton';

const DocEditImportMenu: React.FC<{
  open: () => void;
}> = function (props) {
  return <MenuButton text="Import" content={<ImportMenu {...props} />} />;
};

const ImportMenu: React.FC<{
  open: () => void;
}> = function ({ open }) {
  return (
    <Menu>
      <MenuItem text="From text" onClick={open} />
    </Menu>
  );
};

export default DocEditImportMenu;
