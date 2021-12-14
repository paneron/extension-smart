import { ControlGroup, Dialog } from '@blueprintjs/core';
import React, { useState } from 'react';
import { dialogLayout } from '../../../css/layout';
import { MMELDocument } from '../../model/document';
import DocImport from '../doc/DocImport';
import DocSettings from '../doc/DocSettings';
import DocEditFileMenu from './DocEditFileMenu';
import DocEditImportMenu from './DocEditImportMenu';

type DiagMode = 'setting' | 'import';

const DocEditToolbar: React.FC<{
  doc: MMELDocument;
  setDoc: (x: MMELDocument) => void;
}> = function (props) {
  const [diagMode, setOpen] = useState<DiagMode | undefined>(undefined);

  const fileMenuProps = { ...props, open: () => setOpen('setting') };
  const diagProps = {
    ...fileMenuProps,
    diagMode,
    done: () => setOpen(undefined),
  };

  return (
    <>
      <DocSettingDiag {...diagProps} />
      <ControlGroup>
        <DocEditFileMenu {...fileMenuProps} />
        <DocEditImportMenu open={() => setOpen('import')} />
      </ControlGroup>
    </>
  );
};

const DocSettingDiag: React.FC<{
  doc: MMELDocument;
  setDoc: (x: MMELDocument) => void;
  diagMode: DiagMode | undefined;
  done: () => void;
}> = function (props) {
  const { diagMode, done } = props;

  const content = diagMode ? (
    diagMode === 'setting' ? (
      <DocSettings {...props} />
    ) : (
      <DocImport {...props} />
    )
  ) : (
    <></>
  );
  return (
    <Dialog
      style={dialogLayout}
      isOpen={diagMode !== undefined}
      title="Document Setting"
      onClose={done}
      canEscapeKeyClose={false}
      canOutsideClickClose={false}
    >
      {content}
    </Dialog>
  );
};

export default DocEditToolbar;
