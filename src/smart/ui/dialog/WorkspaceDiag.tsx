/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { Dialog } from '@blueprintjs/core';
import { jsx } from '@emotion/react';
import React from 'react';
import { dialog_layout } from '../../../css/layout';
import MGDDisplayPane from '../../MGDComponents/MGDDisplayPane';
import { EditorModel } from '../../model/editormodel';
import { SMARTDocumentStore, SMARTModelStore } from '../../model/workspace';
import RegistryDocManagement from '../workspace/RegistryDocManagement';
import WorkspaceRegistryList from '../workspace/RegistryList';

export interface WorkspaceDiagPackage {
  regid: string;
  isFromReactNode: boolean;
}

export const WorkspaceDialog: React.FC<{
  diagProps: WorkspaceDiagPackage;
  onClose: () => void;
  modelStore: SMARTModelStore;
  setModelStore: (store: SMARTModelStore) => void;
  model: EditorModel;
  setRegistry: (id: string) => void;
}> = function ({
  diagProps,
  onClose,
  modelStore,
  setModelStore,
  model,
  setRegistry,
}) {
  const regid = diagProps.regid;
  const title = regid === '' ? 'Data management' : `Registry: ${regid}`;
  const store: SMARTDocumentStore = modelStore.store[regid] ?? {
    id: regid,
    docs: {},
  };

  const child =
    regid === '' ? (
      <WorkspaceRegistryList model={model} setRegistry={setRegistry} />
    ) : (
      <RegistryDocManagement
        model={model}
        store={store}
        regid={regid}
        setStore={s => {
          modelStore.store[regid] = s;
          setModelStore({ ...modelStore });
        }}
        onBack={diagProps.isFromReactNode ? undefined : () => setRegistry('')}
        workspace={modelStore.store}
      />
    );
  return (
    <Dialog
      isOpen={true}
      title={title}
      css={[dialog_layout]}
      onClose={onClose}
      canEscapeKeyClose={false}
      canOutsideClickClose={false}
    >
      <MGDDisplayPane>{child}</MGDDisplayPane>
    </Dialog>
  );
};
