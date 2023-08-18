import React, { useContext } from 'react';
import { Menu, MenuDivider, MenuItem } from '@blueprintjs/core';
import { DatasetContext } from '@riboseinc/paneron-extension-kit/context';
import { MMELToText } from '@paneron/libmmel';
import { FILE_TYPE, saveToFileSystem } from '@/smart/utils/IOFunctions';
import type { EditorModel } from '@/smart/model/editormodel';

const EditorFileMenu: React.FC<{
  model: EditorModel;
  openSetting: () => void;
  onRepoSave: () => void;
  openChangeLog: () => void;
}> = function ({ model, openSetting, onRepoSave, openChangeLog }) {
  const { getBlob, writeFileToFilesystem } = useContext(DatasetContext);

  const canSave = getBlob && writeFileToFilesystem;

  // Export
  async function handleSave() {
    const fileData = MMELToText(model);

    await saveToFileSystem({
      getBlob,
      writeFileToFilesystem,
      fileData,
      type : FILE_TYPE.Model,
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
      <MenuItem text="Model settings…" onClick={openSetting} icon="settings" />
      <MenuItem text="Change logs" onClick={openChangeLog} icon="changes" />
    </Menu>
  );
};

export default EditorFileMenu;
