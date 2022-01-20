import { Button, Dialog } from '@blueprintjs/core';
import { Popover2 } from '@blueprintjs/popover2';
import React, { useState } from 'react';
import { MMELRepo, RepoIndex, RepoItemType } from '../../model/repo';
import { ReferenceContent } from '../../model/States';
import RepoItemSelector from '../repo/RepoItemSelector';
import EditorReferenceMenu from './EditorReferenceMenu';

const EditorReferenceMenuButton: React.FC<{
  setReference: (x: ReferenceContent | undefined) => void;
  reference: ReferenceContent | undefined;
  isRepo: boolean;
  setRefRepo: (x: MMELRepo) => void;
  index: RepoIndex;
}> = function (props) {
  const { reference } = props;

  const [type, setType] = useState<RepoItemType | undefined>(undefined);

  return (
    <>
      <Popover2
        minimal
        placement="bottom-start"
        content={
          <EditorReferenceMenu
            {...props}
            setType={setType}
            isCloseEnabled={reference !== undefined}
          />
        }
      >
        <Button>Reference model</Button>
      </Popover2>
      <Dialog
        isOpen={type !== undefined}
        canEscapeKeyClose={false}
        canOutsideClickClose={false}
        style={{
          width: '75vw',
          height: '50vh',
        }}
      >
        {type !== undefined && (
          <RepoItemSelector
            {...props}
            type={type}
            onClose={() => setType(undefined)}
          />
        )}
      </Dialog>
    </>
  );
};

export default EditorReferenceMenuButton;
