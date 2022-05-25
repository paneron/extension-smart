import { Dialog } from '@blueprintjs/core';
import React from 'react';
import { dialogLayout } from '../../../css/layout';
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
    id   : regid,
    docs : {},
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
      style={dialogLayout}
      onClose={onClose}
      canEscapeKeyClose={false}
      canOutsideClickClose={false}
    >
      <MGDDisplayPane>{child}</MGDDisplayPane>
    </Dialog>
  );
};
