import React, { useContext } from 'react';
import { Menu, MenuItem } from '@blueprintjs/core';
import { FILE_TYPE, handleMappingOpen } from '@/smart/utils/IOFunctions';
import { DatasetContext } from '@riboseinc/paneron-extension-kit/context';
import { MapProfile } from '@/smart/model/mapmodel';

const MapperCompareMenu: React.FC<{
  opponent: MapProfile | undefined;
  setDiffMap: (x: MapProfile | undefined) => void;
}> = function ({ opponent, setDiffMap }) {
  const { requestFileFromFilesystem } = useContext(DatasetContext);

  function onClick() {
    handleMappingOpen({
      onMapProfileChanged : setDiffMap,
      requestFileFromFilesystem,
      fileType            : FILE_TYPE.JSON,
    });
  }

  return (
    <Menu>
      <MenuItem text="Open comparand (JSON)" onClick={onClick} />
      {opponent && (
        <MenuItem
          text="Close comparand"
          onClick={() => setDiffMap(undefined)}
        />
      )}
    </Menu>
  );
};

export default MapperCompareMenu;
