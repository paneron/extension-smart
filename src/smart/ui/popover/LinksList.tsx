/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { jsx } from '@emotion/react';
import { Menu, MenuItem } from '@blueprintjs/core';
import React from 'react';

const LinksList: React.FC<{
  links: Set<string>;
}> = function ({ links }) {
  return (
    <Menu
      style={{
        maxWidth: '30vw',
        maxHeight: '45vh',
      }}
    >
      {[...links].map(l => (
        <MenuItem text={l} key={l} />
      ))}
    </Menu>
  );
};

export default LinksList;
