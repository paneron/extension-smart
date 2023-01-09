import React from 'react';
import { IconName, Menu, MenuDivider, MenuItem } from '@blueprintjs/core';
import { MapperViewOption } from '../../model/States';

const MapperOptionMenu: React.FC<{
  viewOption: MapperViewOption;
  setOptions: (opt: MapperViewOption) => void;
  isRepo: boolean;
}> = function ({ viewOption, setOptions, isRepo }) {
  return (
    <Menu>
      <ViewMenuItem
        pname="dataVisible"
        label="Show data"
        viewOption={viewOption}
        setOptions={setOptions}
      />
      <ViewMenuItem
        pname="legVisible"
        label="Show legends"
        viewOption={viewOption}
        setOptions={setOptions}
      />
      <ViewMenuItem
        pname="idVisible"
        label="Show ID"
        viewOption={viewOption}
        setOptions={setOptions}
      />
      {isRepo && (
        <>
          <MenuDivider />
          <ViewMenuItem
            pname="repoMapVisible"
            label="Repo map"
            viewOption={viewOption}
            setOptions={setOptions}
          />
          <ViewMenuItem
            pname="repoLegendVisible"
            label="Repo map legend"
            viewOption={viewOption}
            setOptions={setOptions}
          />
        </>
      )}
    </Menu>
  );
};

const ViewMenuItem: React.FC<{
  pname: keyof MapperViewOption;
  viewOption: MapperViewOption;
  setOptions: (opt: MapperViewOption) => void;
  label: string;
}> = function ({ label, pname, viewOption, setOptions }) {
  const value = viewOption[pname];
  return (
    <MenuItem
      text={label}
      onClick={() => setOptions({ ...viewOption, [pname] : !value })}
      icon={getVisibilityIconName(value)}
    />
  );
};

function getVisibilityIconName(isVisible: boolean): IconName {
  return isVisible ? 'tick' : 'blank';
}

export default MapperOptionMenu;
