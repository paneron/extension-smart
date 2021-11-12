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
  isRepoMode: boolean;
  onRepoSave: () => void;
}> = function ({
  setModelWrapper,
  getLatestLayout,
  setDialogType,
  isRepoMode,
  onRepoSave,
}) {
  const { logger, getBlob, writeFileToFilesystem, requestFileFromFilesystem } =
    useContext(DatasetContext);

  const canOpen = requestFileFromFilesystem;
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

  return (
    <Menu>
      {isRepoMode ? (
        <>
          <MenuItem
            text="Save"
            label="Ctrl + S"
            onClick={onRepoSave}
            icon="floppy-disk"
          />
          <MenuItem text="Export" onClick={onRepoSave} icon="export">
            <MenuItem
              text="SMART file"
              onClick={handleSave}
              disabled={!canSave}
            />
          </MenuItem>
        </>
      ) : (
        <>
          <MenuItem text="New" onClick={handleNew} icon="document" />
          <MenuItem
            text="Open…"
            disabled={!canOpen}
            onClick={() =>
              handleModelOpen({
                setModelWrapper,
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
        </>
      )}
      <MenuDivider />
      <MenuItem
        text="Model settings…"
        onClick={handleOpenSettings}
        icon="settings"
      />
    </Menu>
  );
};

export default EditorFileMenu;
