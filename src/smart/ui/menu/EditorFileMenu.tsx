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
import { createNewEditorModel } from '../../utils/EditorFactory';
import { MMELToText } from '../../serialize/MMEL';
import { DiagTypes } from '../dialog/dialogs';
import {
  FILE_TYPE,
  handleModelOpen,
  saveToFileSystem,
} from '../../utils/IOFunctions';

const EditorFileMenu: React.FC<{
  setModelWrapper: (m: ModelWrapper) => void;
  getLatestLayout: () => ModelWrapper;
  setDialogType: (x: DiagTypes) => void;
}> = function ({ setModelWrapper, getLatestLayout, setDialogType }) {
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
    const model = createNewEditorModel();
    const mw = createEditorModelWrapper(model);
    setModelWrapper(mw);
  }

  // Export
  async function handleSave() {
    const mw = getLatestLayout();
    const fileData = MMELToText(mw.model);

    await saveToFileSystem({
      getBlob,
      writeFileToFilesystem,
      fileData,
      type: FILE_TYPE.Model,
    });
  }

  // Settings
  function handleImportModel() {
    setDialogType(DiagTypes.IMPORTMODEL);
  }

  return (
    <Menu>
      <MenuItem text="New" onClick={handleNew} icon="document" />
      <MenuItem
        text="Open…"
        disabled={!canOpen}
        onClick={() =>
          handleModelOpen({
            setModelWrapper,
            useDecodedBlob,
            requestFileFromFilesystem,
            logger,
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
      <MenuDivider />
      <MenuItem
        text="Model settings…"
        onClick={handleOpenSettings}
        icon="settings"
      />
      <MenuItem
        text="Import from model"
        onClick={handleImportModel}
        icon="import"
      />
    </Menu>
  );
};

export default EditorFileMenu;
