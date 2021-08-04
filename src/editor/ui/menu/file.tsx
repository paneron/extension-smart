/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { jsx } from '@emotion/react';
import React, { useContext } from 'react';
import { Menu, MenuDivider, MenuItem } from '@blueprintjs/core';
import { DatasetContext } from '@riboseinc/paneron-extension-kit/context';
import {
  createEditorModelWrapper,
  ModelWrapper,
} from '../../model/modelwrapper';
import { createNewModel } from '../../utils/EditorFactory';
import { MMELToText, textToMMEL } from '../../serialize/MMEL';
import { DiagTypes } from '../../model/dialog';

const FileMenu: React.FC<{
  setModelWrapper: (m: ModelWrapper) => void;
  saveModel: () => ModelWrapper;
  setDialogType: (x: DiagTypes) => void;
}> = function ({ setModelWrapper, saveModel, setDialogType }) {
  const {
    logger,
    getBlob,
    useDecodedBlob,
    writeFileToFilesystem,
    requestFileFromFilesystem,
  } = useContext(DatasetContext);

  const canOpen = requestFileFromFilesystem && useDecodedBlob;
  const canSave = getBlob && writeFileToFilesystem;

  // Settings
  function handleOpenSettings() {
    setDialogType(DiagTypes.SETTING);
  }

  // New
  function handleNew() {
    const model = createNewModel();
    const mw = createEditorModelWrapper(model);
    setModelWrapper(mw);
  }

  // Open
  function parseModel(data: string) {
    logger?.log('Importing model');
    try {
      const model = textToMMEL(data);
      const mw = createEditorModelWrapper(model);
      setModelWrapper(mw);
    } catch (e) {
      logger?.log('Failed to load model', e);
    }
  }
  async function handleOpen() {
    if (requestFileFromFilesystem && useDecodedBlob) {
      logger?.log('Requesting file');
      requestFileFromFilesystem(
        {
          prompt: 'Choose an MMEL file to import',
          allowMultiple: false,
          filters: [{ name: 'MMEL files', extensions: ['mmel'] }],
        },
        selectedFiles => {
          logger?.log('Requesting file: Got selection');
          const fileData = Object.values(selectedFiles ?? {})[0];
          if (fileData) {
            const fileDataAsString = useDecodedBlob({
              blob: fileData,
            }).asString;
            logger?.log(
              'Requesting file: Decoded blob',
              fileDataAsString.substr(0, 20)
            );
            parseModel(fileDataAsString);
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

  // Export
  function handleSave() {
    return async () => {
      const mw = saveModel();
      const fileData = MMELToText(mw.model);

      if (getBlob && writeFileToFilesystem) {
        const blob = await getBlob(fileData);
        await writeFileToFilesystem({
          dialogOpts: {
            prompt: 'Choose location to save',
            filters: [{ name: 'All files', extensions: ['*'] }],
          },
          bufferData: blob,
        });
      } else {
        throw new Error('File export function(s) are not provided');
      }
    };
  }

  return (
    <Menu>
      <MenuItem text="New" onClick={handleNew} icon="document" />
      <MenuItem
        text="Open…"
        disabled={!canOpen}
        onClick={handleOpen}
        icon="document-open"
      />
      <MenuItem
        text="Save…"
        onClick={handleSave()}
        disabled={!canSave}
        icon="floppy-disk"
      />
      <MenuDivider />
      <MenuItem
        text="Model settings…"
        onClick={handleOpenSettings}
        icon="settings"
      />
    </Menu>
  );
};

export default FileMenu;
