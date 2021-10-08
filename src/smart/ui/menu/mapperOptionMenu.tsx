/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { jsx } from '@emotion/react';
import React from 'react';
import { IconName, Menu, MenuItem } from '@blueprintjs/core';
import { MapperViewOption } from '../../model/States';

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

  function onIdVisibilityChanged() {
    setOptions({ ...viewOption, idVisible: !viewOption.idVisible });
  }

  return (
    <Menu>
      <MenuItem
        text="Show data"
        onClick={onDataVisibilityChanged}
        icon={getVisibilityIconName(viewOption.dataVisible)}
      />
      <MenuItem
        text="Show legends"
        onClick={onLegendVisibilityChanged}
        icon={getVisibilityIconName(viewOption.legVisible)}
      />
      <MenuItem
        text="Show ID"
        onClick={onIdVisibilityChanged}
        icon={getVisibilityIconName(viewOption.idVisible)}
      />
    </Menu>
  );
};

function getVisibilityIconName(isVisible: boolean): IconName {
  return isVisible ? 'tick' : 'blank';
}

export default MapperOptionMenu;
