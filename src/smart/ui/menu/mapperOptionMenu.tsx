/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { jsx } from '@emotion/react';
import React from 'react';
import { Menu, MenuItem } from '@blueprintjs/core';
import { MapperViewOption } from '../../model/state';

const MapperOptionMenu: React.FC<{
  viewOption: MapperViewOption;
  setOptions: (opt: MapperViewOption) => void;
}> = function ({ viewOption, setOptions }) {
  function onDataVisibilityChanged() {
    setOptions({ ...viewOption, dataVisible: !viewOption.dataVisible });
  }

  function onLegendVisibilityChanged() {
    setOptions({ ...viewOption, legVisible: !viewOption.legVisible });
  }

  return (
    <Menu>
      <MenuItem
        text="Show data"
        onClick={onDataVisibilityChanged}
        icon={viewOption.dataVisible ? 'tick' : 'blank'}
      />
      <MenuItem
        text="Show legends"
        onClick={onLegendVisibilityChanged}
        icon={viewOption.legVisible ? 'tick' : 'blank'}
      />
    </Menu>
  );
};

export default MapperOptionMenu;
