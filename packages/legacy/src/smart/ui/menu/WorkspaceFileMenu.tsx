import React from 'react';
import { Button, ControlGroup, Menu, MenuItem } from '@blueprintjs/core';
import { Popover2 } from '@blueprintjs/popover2';
import MGDButton from '@/smart/MGDComponents/MGDButton';
import { MGDButtonType } from '@/css/MGDButton';
import { WorkspaceDiagPackage } from '@/smart/ui/dialog/WorkspaceDiag';

const WorkspaceFileMenu: React.FC<{
  onRepoSave: () => void;
  setDiagProps: (x: WorkspaceDiagPackage | undefined) => void;
  drillUp: () => void;
}> = function ({ onRepoSave, setDiagProps, drillUp }) {
  return (
    <ControlGroup>
      <Popover2
        minimal
        placement="bottom-start"
        content={
          <Menu>
            <MenuItem
              text="Save"
              onClick={onRepoSave}
              label="Ctrl + S"
              icon="floppy-disk"
            />
          </Menu>
        }
      >
        <Button>Workspace</Button>
      </Popover2>
      <Button
        onClick={() =>
          setDiagProps({
            regid           : '',
            isFromReactNode : false,
          })
        }
      >
        Data Registry
      </Button>
      <MGDButton
        type={MGDButtonType.Primary}
        disabled={history.length <= 1}
        onClick={drillUp}
      >
        Drill up
      </MGDButton>
    </ControlGroup>
  );
};

export default WorkspaceFileMenu;
