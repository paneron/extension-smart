/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { jsx } from '@emotion/react';
import { Menu, MenuItem } from '@blueprintjs/core';
import React from 'react';
import { MMELTable } from '../../serialize/interface/supportinterface';

const NonTextReferenceList: React.FC<{
  refs: MMELTable[];
  setShow: (x: MMELTable | undefined) => void;
}> = function ({ refs, setShow }) {
  // const [show, setShow] = useState<MMELTable|undefined>(undefined);

  function showRef(ref: MMELTable) {
    setShow(ref);
  }

  return (
    <Menu
      style={{
        maxWidth: '30vw',
        maxHeight: '45vh',
      }}
    >
      {refs.map(ref => (
        <MenuItem text={ref.title} key={ref.id} onClick={() => showRef(ref)} />
      ))}
    </Menu>
  );
};

export default NonTextReferenceList;
