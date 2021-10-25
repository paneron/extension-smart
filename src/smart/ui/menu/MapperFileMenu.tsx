/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { jsx } from '@emotion/react';
import React, { useContext } from 'react';
import { Menu, MenuDivider, MenuItem } from '@blueprintjs/core';
import { DatasetContext } from '@riboseinc/paneron-extension-kit/context';
import { createMapProfile, MapProfile } from '../../model/mapmodel';
import {
  FILE_TYPE,
  handleMappingOpen,
  saveToFileSystem,
} from '../../utils/IOFunctions';

const MapperFileMenu: React.FC<{
  mapProfile: MapProfile;
  onMapProfileChanged: (m: MapProfile) => void;
  onMapImport: () => void;
  isRepoMode: boolean;
  onRepoSave: () => void;
}> = function ({
  mapProfile,
  onMapProfileChanged,
  onMapImport,
  isRepoMode,
  onRepoSave,
}) {
  const {
    getBlob,
    useDecodedBlob,
    writeFileToFilesystem,
    requestFileFromFilesystem,
  } = useContext(DatasetContext);

  const canOpen = requestFileFromFilesystem && useDecodedBlob;
  const canSave = getBlob && writeFileToFilesystem;

  function handleNew() {
    onMapProfileChanged(createMapProfile());
  }

  async function handleSave() {
    const fileData = JSON.stringify(mapProfile);

    await saveToFileSystem({
      getBlob,
      writeFileToFilesystem,
      fileData,
      type: FILE_TYPE.Map,
    });
  }

  return (
    <Menu>
      {isRepoMode ? (
        <MenuItem
          text="Save"
          onClick={onRepoSave}
          label="Ctrl + S"
          icon="floppy-disk"
        />
      ) : (
        <>
          <MenuItem text="New" onClick={handleNew} icon="document" />
          <MenuItem
            text="Open…"
            disabled={!canOpen}
            onClick={() =>
              handleMappingOpen({
                onMapProfileChanged,
                useDecodedBlob,
                requestFileFromFilesystem,
              })
            }
            icon="document-open"
          />
          <MenuItem
            text="Save…"
            onClick={handleSave}
            disabled={!canSave}
            icon="floppy-disk"
          />
        </>
      )}
      <MenuDivider />
      <MenuItem text="Auto Mapper" onClick={onMapImport} icon="data-lineage" />
    </Menu>
  );
};

export default MapperFileMenu;
