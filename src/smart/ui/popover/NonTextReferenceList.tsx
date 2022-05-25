import { Menu, MenuItem } from '@blueprintjs/core';
import React from 'react';
import {
  BINARY_TYPE,
  MMELFigure,
  MMELTable,
} from '../../serialize/interface/supportinterface';
import { isMMELTable } from '../../model/editormodel';

const titles: Record<BINARY_TYPE, string> = {
  'fig'   : 'Figure',
  'video' : 'Video',
  '3d'    : '3D Model',
};

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
        maxWidth  : '30vw',
        maxHeight : '45vh',
      }}
    >
      {refs.map(ref => (
        <MenuItem
          text={
            (isMMELTable(ref) ? 'Table: ' : `${titles[ref.type]}: `) + ref.title
          }
          key={ref.id}
          onClick={() => showRef(ref)}
        />
      ))}
    </Menu>
  );
};

export default NonTextReferenceList;
