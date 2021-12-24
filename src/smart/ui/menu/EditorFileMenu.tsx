import React, { useContext } from 'react';
import { Menu, MenuDivider, MenuItem } from '@blueprintjs/core';
import { DatasetContext } from '@riboseinc/paneron-extension-kit/context';
import { ModelWrapper } from '../../model/modelwrapper';
import { MMELToText } from '../../serialize/MMEL';
import { DiagTypes } from '../dialog/dialogs';
import { FILE_TYPE, saveToFileSystem } from '../../utils/IOFunctions';

const EditorFileMenu: React.FC<{
  getLatestLayout: () => ModelWrapper;
  setDialogType: (x: DiagTypes) => void;
  onRepoSave: () => void;
}> = function ({ getLatestLayout, setDialogType, onRepoSave }) {
  const { getBlob, writeFileToFilesystem } = useContext(DatasetContext);

  const canSave = getBlob && writeFileToFilesystem;

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
      <MenuItem
        text="Save"
        label="Ctrl + S"
        onClick={onRepoSave}
        icon="floppy-disk"
      />
      <MenuItem text="Export" onClick={onRepoSave} icon="export">
        <MenuItem text="SMART file" onClick={handleSave} disabled={!canSave} />
      </MenuItem>
      <MenuDivider />
      <MenuItem
        text="Model settings…"
        onClick={() => setDialogType(DiagTypes.SETTING)}
        icon="settings"
      />
    </Menu>
  );
};

export default EditorFileMenu;
