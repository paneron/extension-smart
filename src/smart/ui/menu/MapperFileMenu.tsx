import React, { useContext } from 'react';
import { Menu, MenuDivider, MenuItem } from '@blueprintjs/core';
import { DatasetContext } from '@riboseinc/paneron-extension-kit/context';
import type { MapProfile } from '@/smart/model/mapmodel';
import { createMapProfile } from '@/smart/model/mapmodel';
import {
  FILE_TYPE,
  handleMappingOpen,
  saveToFileSystem,
} from '@/smart/utils/IOFunctions';
import type { MMELRepo } from '@/smart/model/repo';

const MapperFileMenu: React.FC<{
  mapProfile: MapProfile;
  onMapProfileChanged: (m: MapProfile) => void;
  onMapImport: () => void;
  onRepoSave: () => void;
  onResetMapping: () => void;
  onMapProfileImported: (m: MapProfile) => void;
  repo?: MMELRepo;
}> = function ({
  mapProfile,
  onMapProfileChanged,
  onMapImport,
  onRepoSave,
  onResetMapping,
  onMapProfileImported,
  repo,
}) {
  const { getBlob, writeFileToFilesystem, requestFileFromFilesystem } =
    useContext(DatasetContext);

  const canOpen = requestFileFromFilesystem;
  const canSave = getBlob && writeFileToFilesystem;

  function handleNew() {
    onMapProfileChanged(createMapProfile());
  }

  async function handleSave() {
    const fileData = JSON.stringify(mapProfile, undefined, 2);

    await saveToFileSystem({
      getBlob,
      writeFileToFilesystem,
      fileData,
      type : FILE_TYPE.Map,
    });
  }

  async function handleExport() {
    const fileData = JSON.stringify(mapProfile, undefined, 2);

    await saveToFileSystem({
      getBlob,
      writeFileToFilesystem,
      fileData,
      type : FILE_TYPE.JSON,
    });
  }

  async function handleImport() {
    handleMappingOpen({
      onMapProfileChanged : onMapProfileImported,
      requestFileFromFilesystem,
      fileType            : FILE_TYPE.JSON,
    });
  }

  async function handleImportMapping() {
    handleMappingOpen({
      onMapProfileChanged : onMapProfileImported,
      requestFileFromFilesystem,
    });
  }

  return (
    <Menu>
      {repo ? (
        <>
          <MenuItem
            text="Save"
            onClick={onRepoSave}
            label="Ctrl + S"
            icon="floppy-disk"
          />
          <MenuDivider />
          <MenuItem
            text="Clear current mapping"
            onClick={onResetMapping}
            intent="danger"
            icon="eraser"
          />
          <MenuItem
            text="Clear all mappings"
            onClick={handleNew}
            intent="danger"
            icon="trash"
          />
          <MenuDivider />
          <MenuItem text="Import" icon="import">
            <MenuItem text="JSON-LD file" onClick={handleImport} />
            <MenuItem text="Mapping file" onClick={handleImportMapping} />
          </MenuItem>
          <MenuItem text="Export" icon="export">
            <MenuItem text="JSON-LD file" onClick={handleExport} />
            <MenuItem text="Mapping file" onClick={handleSave} />
          </MenuItem>
        </>
      ) : (
        <>
          <MenuItem text="New" onClick={handleNew} icon="document" />
          <MenuItem
            text="Open…"
            disabled={!canOpen}
            onClick={() =>
              handleMappingOpen({
                onMapProfileChanged,
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
