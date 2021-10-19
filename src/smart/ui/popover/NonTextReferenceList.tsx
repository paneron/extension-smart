/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { jsx } from '@emotion/react';
import { Menu, MenuItem } from '@blueprintjs/core';
import React from 'react';
import {
  MMELFigure,
  MMELTable,
} from '../../serialize/interface/supportinterface';
import { isMMELTable } from '../../model/editormodel';

const NonTextReferenceList: React.FC<{
  refs: (MMELTable | MMELFigure)[];
  setShow: (x: MMELTable | MMELFigure | undefined) => void;
}> = function ({ refs, setShow }) {
  function showRef(ref: MMELTable | MMELFigure) {
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
        <MenuItem
          text={(isMMELTable(ref) ? 'Table: ' : 'Figure: ') + ref.title}
          key={ref.id}
          onClick={() => showRef(ref)}
        />
      ))}
    </Menu>
  );
};

export default NonTextReferenceList;
