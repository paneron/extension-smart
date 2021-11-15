import React, { useContext } from 'react';
import { Menu, MenuDivider, MenuItem } from '@blueprintjs/core';
import { DatasetContext } from '@riboseinc/paneron-extension-kit/context';
import { ModelWrapper } from '../../model/modelwrapper';
import { createNewSMARTWorkspace, SMARTWorkspace } from '../../model/workspace';
import {
  FILE_TYPE,
  handleModelOpen,
  handleWSOpen,
  saveToFileSystem,
} from '../../utils/IOFunctions';

const WorkspaceFileMenu: React.FC<{
  workspace: SMARTWorkspace;
  setModelWrapper: (m: ModelWrapper) => void;
  setWorkspace: (ws: SMARTWorkspace) => void;
  onClose: () => void;
  isRepoMode: boolean;
  onRepoSave: () => void;
}> = function ({
  workspace,
  setModelWrapper,
  setWorkspace,
  onClose,
  isRepoMode,
  onRepoSave,
}) {
  const { getBlob, writeFileToFilesystem, requestFileFromFilesystem } =
    useContext(DatasetContext);

  const canOpen = requestFileFromFilesystem;
  const canSave = getBlob && writeFileToFilesystem;

  function handleNewWorkspace() {
    setWorkspace(createNewSMARTWorkspace());
  }

  async function handleWSSave() {
    const fileData = JSON.stringify(workspace, undefined, 2);

    await saveToFileSystem({
      getBlob,
      writeFileToFilesystem,
      fileData,
      type: FILE_TYPE.Workspace,
    });
  }

  if (isRepoMode) {
    return (
      <Menu>
        <MenuItem
          text="Save"
          onClick={onRepoSave}
          label="Ctrl + S"
          icon="floppy-disk"
        />
      </Menu>
    );
  } else {
    return (
      <Menu>
        <MenuItem
          text="New Workspace"
          onClick={handleNewWorkspace}
          icon="projects"
        />
        <MenuItem
          text="Open Workspace"
          disabled={!canOpen}
          onClick={() =>
            handleWSOpen({
              setWorkspace,
              requestFileFromFilesystem,
            })
          }
          icon="folder-shared-open"
        />
        <MenuItem
          text="Save Workspace"
          onClick={handleWSSave}
          disabled={!canSave}
          icon="floppy-disk"
        />
        <MenuDivider />
        <MenuItem
          text="Open Model"
          onClick={() =>
            handleModelOpen({
              setModelWrapper,
              requestFileFromFilesystem,
            })
          }
          icon="graph"
        />
        <MenuItem text="Close Model" onClick={onClose} icon="cross" />
      </Menu>
    );
  }
};

export default WorkspaceFileMenu;
