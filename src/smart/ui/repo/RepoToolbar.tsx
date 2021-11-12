import { Button, ControlGroup } from '@blueprintjs/core';
import { Popover2 } from '@blueprintjs/popover2';
import React, { useState } from 'react';
import { MMELDocument } from '../../model/document';
import {
  createEditorModelWrapper,
  ModelWrapper,
} from '../../model/modelwrapper';
import { RepoIndex, RepoItemType } from '../../model/repo';
import { createNewEditorModel } from '../../utils/EditorFactory';
import AskIDForSaveMenu from '../popover/AskIDForSaveMenu';
import RepoImportMenu from './RepoImportMenu';

const RepoToolbar: React.FC<{
  addMW: (m: ModelWrapper, type: RepoItemType) => void;
  addDoc: (x: MMELDocument) => void;
  isBSI: boolean;
  index: RepoIndex;
}> = function ({ addMW, addDoc, isBSI, index }) {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  function checkId(id: string): boolean {
    if (id === '') {
      alert('Namespace cannot be empty');
      return false;
    }
    if (index[id]) {
      alert('Item of this namespace already exists');
      return false;
    }
    return true;
  }

  function saveNew(id: string) {
    const model = createNewEditorModel();
    model.meta.namespace = id;
    const mw = createEditorModelWrapper(model);
    addMW(mw, 'Imp');
    setIsOpen(false);
  }

  return (
    <ControlGroup>
      <Popover2
        minimal
        placement="bottom-start"
        content={
          <RepoImportMenu
            addImpMW={m => addMW(m, 'Imp')}
            addRefMW={m => addMW(m, 'Ref')}
            addDoc={addDoc}
            isBSIEnabled={isBSI}
          />
        }
      >
        <Button>Import</Button>
      </Popover2>
      <Popover2
        minimal
        placement="bottom-start"
        isOpen={isOpen}
        content={
          <AskIDForSaveMenu
            title="Namespace"
            validTest={checkId}
            onSave={saveNew}
            buttonText="Create"
          />
        }
      >
        <Button onClick={() => setIsOpen(x => !x)}>New model</Button>
      </Popover2>
    </ControlGroup>
  );
};

export default RepoToolbar;
