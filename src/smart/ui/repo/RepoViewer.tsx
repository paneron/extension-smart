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
import {
  getPathByNS,
  MMELToSerializable,
  RepoFileType,
} from '../../utils/repo/io';
import RepoImportButton from './RepoImportButton';
import RepoModelFile from './RepoItem';
import RepoInfoPane from './RepoInfoPane';
import RepoCloseButton from './RepoCloseButton';
import { EditorModel } from '../../model/editormodel';
import { createNewSMARTWorkspace } from '../../model/workspace';
import { getNamespace } from '../../utils/ModelFunctions';

const RepoViewer: React.FC<{
  isVisible: boolean;
  className?: string;
  repo?: MMELRepo;
  setRepo: (x: MMELRepo | undefined) => void;
}> = function ({ isVisible, className, repo, setRepo }) {
  const { useObjectData, updateObjects } = useContext(DatasetContext);

  const [toaster] = useState<IToaster>(Toaster.create());
  const repoFile = useObjectData({ objectPaths: [repoIndexPath] });

  const repoData = repoFile.value.data[repoIndexPath];
  const index = (repoData ?? {}) as RepoIndex;

  async function saveIndex(
    updated: RepoIndex,
    ns?: string,
    model?: EditorModel
  ) {
    if (updateObjects) {
      if (ns !== undefined && model !== undefined) {
        await updateObjects({
          commitMessage: 'Updating concept',
          _dangerouslySkipValidation: true,
          objectChangeset: {
            [repoIndexPath]: { oldValue: undefined, newValue: updated },
            [getPathByNS(ns, RepoFileType.MODEL)]: {
              newValue: MMELToSerializable(model),
            },
            [getPathByNS(ns, RepoFileType.MAP)]: {
              newValue: { id: getNamespace(model), mapSet: {}, docs: {} },
            },
            [getPathByNS(ns, RepoFileType.WORKSPACE)]: {
              newValue: createNewSMARTWorkspace(),
            },
          },
        });
      } else {
        await updateObjects({
          commitMessage: 'Updating concept',
          _dangerouslySkipValidation: true,
          objectChangeset: {
            [repoIndexPath]: { oldValue: undefined, newValue: updated },
          },
        });
      }
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
      saveIndex(updated, ns, model);
      toaster.show({
        message: `Done: model with namespace ${ns} added to the repository`,
        intent: 'success',
      });
    }
  }

  function deleteModel(ns: string) {
    const updated = { ...index };
    delete updated[ns];
    saveIndex(updated);
    if (ns === repo) {
      setRepo(undefined);
    }
  }

  const toolbar = (
    <ControlGroup>
      <RepoImportButton addMW={addMW} />
      {repo !== undefined && (
        <RepoCloseButton onClose={() => setRepo(undefined)} />
      )}
    </ControlGroup>
  );

  return isVisible ? (
    <Workspace toolbar={toolbar} className={className}>
      <RepoInfoPane repo={repo} index={index} />
      <div css={react_flow_container_layout}>
        {Object.values(index).length === 0 && <EmptyMsg />}
        <div
          style={{
            display: 'flex',
            gap: 10,
            margin: 10,
          }}
        >
          {Object.entries(index).map(([ns, x]) => (
            <RepoModelFile
              key={ns}
              file={x}
              onDelete={() => deleteModel(ns)}
              onOpen={() => setRepo(ns)}
            />
          ))}
        </div>
      </div>
    </Workspace>
  ) : (
    <div></div>
  );
};

const EmptyMsg = () => (
  <p style={{ margin: 10 }}>No document in the repository.</p>
);

export default RepoViewer;
