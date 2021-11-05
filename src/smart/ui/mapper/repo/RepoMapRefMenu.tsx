import { Popover2 } from '@blueprintjs/popover2';
import React, { useState } from 'react';
import { Button, Dialog } from '@blueprintjs/core';
import RepoExternalFileMenu from './RepoExternalFileMenu';
import { MMELDocument } from '../../../model/document';
import { ModelWrapper } from '../../../model/modelwrapper';
import RepoInternalFileMenu from './RepoInternalFileMenu';
import { RepoIndex, RepoItemType } from '../../../model/repo';
import RepoItemSelector from '../../repo/RepoItemSelector';

const RepoMapRefMenus: React.FC<{
  setModelWrapper: (x: ModelWrapper) => void;
  setDocument: (x: MMELDocument) => void;
  setRefRepo: (x: string) => void;
  index: RepoIndex;
}> = function (props) {
  const [type, setType] = useState<RepoItemType | undefined>(undefined);

  return (
    <>
      <Popover2
        minimal
        placement="bottom-start"
        content={<RepoInternalFileMenu setType={setType} />}
      >
        <Button>Repository</Button>
      </Popover2>
      <Popover2
        minimal
        placement="bottom-start"
        content={<RepoExternalFileMenu {...props} />}
      >
        <Button>External</Button>
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

export default RepoMapRefMenus;
