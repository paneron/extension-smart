import React, { useContext } from 'react';
import { Menu, MenuDivider, MenuItem } from '@blueprintjs/core';
import { DatasetContext } from '@riboseinc/paneron-extension-kit/context';
import { MMELToText } from '../../serialize/MMEL';
import { DiagTypes } from '../dialog/dialogs';
import { FILE_TYPE, saveToFileSystem } from '../../utils/IOFunctions';
import { EditorModel } from '../../model/editormodel';

const EditorFileMenu: React.FC<{
  model: EditorModel;
  setDialogType: (x: DiagTypes) => void;
  onRepoSave: () => void;
}> = function ({ model, setDialogType, onRepoSave }) {
  const { getBlob, writeFileToFilesystem } = useContext(DatasetContext);

  const canSave = getBlob && writeFileToFilesystem;

  // Export
  async function handleSave() {
    const fileData = MMELToText(model);

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
      <MenuItem text="Export" icon="export">
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
