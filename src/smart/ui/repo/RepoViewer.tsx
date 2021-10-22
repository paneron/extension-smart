/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { jsx } from '@emotion/react';
import { ControlGroup, IToaster, Toaster } from '@blueprintjs/core';
import { DatasetContext } from '@riboseinc/paneron-extension-kit/context';
import Workspace from '@riboseinc/paneron-extension-kit/widgets/Workspace';
import { useContext, useState } from 'react';
import { react_flow_container_layout } from '../../../css/layout';
import { ModelWrapper } from '../../model/modelwrapper';
import { MMELRepo, RepoIndex, repoIndexPath, RepoItem } from '../../model/repo';
import { repoRead, repoWrite } from '../../utils/repo/io';
import RepoImportButton from './RepoImportButton';
import RepoModelFile from './RepoItem';

const RepoViewer: React.FC<{
  isVisible: boolean;
  className?: string;
  repo?: MMELRepo;
  setRepo: (x?: MMELRepo) => void;
}> = function ({ isVisible, className, repo, setRepo }) {
  const { useObjectData, updateObjects } = useContext(DatasetContext);
  const [toaster] = useState<IToaster>(Toaster.create());
  const index = repoRead<RepoIndex>(repoIndexPath, useObjectData) ?? {};

  function saveIndex(updated: RepoIndex) {
    if (updateObjects) {
      repoWrite(repoIndexPath, updated, updateObjects);
    } else {
      toaster.show({
        message: 'No write access to the repository',
        intent: 'danger',
      });
    }
  }

  function addMW(m: ModelWrapper) {
    const model = m.model;
    const meta = model.meta;
    const ns = meta.namespace;
    if (ns === '') {
      toaster.show({
        message: 'Invalid model: namespace is empty',
        intent: 'danger',
      });
    } else if (index[ns] !== undefined) {
      toaster.show({
        message: 'Error: model with the same namespace already exists',
        intent: 'danger',
      });
    } else {
      const newItem: RepoItem = {
        shortname: meta.shortname,
        title: meta.title,
        date: new Date(),
      };
      const updated = { ...index, [ns]: newItem };
      saveIndex(updated);
    }
  }

  function deleteModel(ns: string) {
    const updated = { ...index };
    delete updated[ns];
    saveIndex(updated);
  }

  const toolbar = (
    <ControlGroup>
      <RepoImportButton addMW={addMW} />
    </ControlGroup>
  );

  return isVisible ? (
    <Workspace toolbar={toolbar} className={className}>
      <div css={react_flow_container_layout}>
        {Object.values(index).length === 0 && <EmptyMsg />}
        <div
          style={{
            display: 'flex',
            gap: 10,
            margin: 10,
          }}
        >
          {Object.entries(index).map(([key, x]) => (
            <RepoModelFile
              key={key}
              file={x}
              onDelete={() => deleteModel(key)}
            />
          ))}
        </div>
      </div>
    </Workspace>
  ) : (
    <div></div>
  );
};

const EmptyMsg = () => <p>No document in the repository.</p>;

export default RepoViewer;
