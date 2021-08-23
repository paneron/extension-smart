/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { jsx } from '@emotion/react';
import React, { useContext } from 'react';
import { Menu, MenuItem } from '@blueprintjs/core';
import { DatasetContext } from '@riboseinc/paneron-extension-kit/context';
import { createMapProfile, MapProfile } from '../mapper/mapmodel';

const MapperFileMenu: React.FC<{
  mapProfile: MapProfile;
  onMapProfileChanged: (m: MapProfile) => void;
}> = function ({ mapProfile, onMapProfileChanged: onMapProfileChanged }) {
  const {
    logger,
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

  function handleSave() {
    return async () => {
      const fileData = JSON.stringify(mapProfile);

      if (getBlob && writeFileToFilesystem) {
        const blob = await getBlob(fileData);
        await writeFileToFilesystem({
          dialogOpts: {
            prompt: 'Choose location to save',
            filters: [{ name: 'MAP files', extensions: ['map'] }],
          },
          bufferData: blob,
        });
      } else {
        throw new Error('File export function(s) are not provided');
      }
    };
  }

  async function handleMappingOpen() {
    if (requestFileFromFilesystem && useDecodedBlob) {
      logger?.log('Requesting file');
      requestFileFromFilesystem(
        {
          prompt: 'Choose a MAP file to import',
          allowMultiple: false,
          filters: [{ name: 'MAP files', extensions: ['map'] }],
        },
        selectedFiles => {
          logger?.log('Requesting file: Got selection');
          const fileData = Object.values(selectedFiles ?? {})[0];
          logger?.log('File data');
          if (fileData) {
            const fileDataAsString = useDecodedBlob({
              blob: fileData,
            }).asString;
            logger?.log(
              'Requesting file: Decoded blob',
              fileDataAsString.substr(0, 20)
            );
            onMapProfileChanged(JSON.parse(fileDataAsString) as MapProfile);
          } else {
            logger?.log('Requesting file: No file data received');
            console.error('Import file: no file data received');
          }
        }
      );
    } else {
      throw new Error('File import function not availbale');
    }
  }

  return (
    <Menu>
      <MenuItem text="New" onClick={handleNew} icon="document" />
      <MenuItem
        text="Open…"
        disabled={!canOpen}
        onClick={handleMappingOpen}
        icon="document-open"
      />
      <MenuItem
        text="Save…"
        onClick={handleSave()}
        disabled={!canSave}
        icon="floppy-disk"
      />
    </Menu>
  );
};

export default MapperFileMenu;
