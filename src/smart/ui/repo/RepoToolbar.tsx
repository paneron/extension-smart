import { Button, ControlGroup, Dialog } from '@blueprintjs/core';
import { Popover2 } from '@blueprintjs/popover2';
import React, { useState } from 'react';
import { MMELDocument } from '../../model/document';
import {
  createEditorModelWrapper,
  ModelWrapper,
} from '../../model/modelwrapper';
import { MMELRepo, RepoIndex, RepoItemType } from '../../model/repo';
import {
  EXTENSIONVERSION,
  MODELVERSION,
  PANERONVERSION,
} from '../../utils/constants';
import { createNewEditorModel } from '../../utils/EditorFactory';
import AskIDForSaveMenu from '../popover/AskIDForSaveMenu';
import RepoAIMenu from './RepoAIMenu';
import RepoImportMenu from './RepoImportMenu';
import RepoItemSelector from './RepoItemSelector';

const RepoToolbar: React.FC<{
  addMW: (m: ModelWrapper, type: RepoItemType) => void;
  addDoc: (x: MMELDocument) => void;
  isBSI: boolean;
  index: RepoIndex;
  setAiRepo: (x: MMELRepo) => void;
}> = function ({ addMW, addDoc, isBSI, index, setAiRepo }) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isAI, setAI] = useState<boolean>(false);

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

  function showVersion() {
    alert(
      `Extension version:\n${EXTENSIONVERSION}\nModel version\n${MODELVERSION}\nTested on Paneron version:\n${PANERONVERSION}`
    );
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
      <Popover2
        minimal
        placement="bottom-start"
        content={<RepoAIMenu requireAI={() => setAI(true)} />}
      >
        <Button>Translate</Button>
      </Popover2>
      <Button onClick={showVersion}>Version</Button>
      <Dialog
        isOpen={isAI}
        canEscapeKeyClose={false}
        canOutsideClickClose={false}
        style={{
          width: '75vw',
          height: '50vh',
        }}
      >
        {isAI && (
          <RepoItemSelector
            setRefRepo={setAiRepo}
            type={'Doc'}
            onClose={() => setAI(false)}
            index={index}
          />
        )}
      </Dialog>
    </ControlGroup>
  );
};

export default RepoToolbar;
