import type { IToastProps } from '@blueprintjs/core';
import { DatasetContext } from '@riboseinc/paneron-extension-kit/context';
import type { ObjectChangeset } from '@riboseinc/paneron-extension-kit/types/objects';
import React from 'react';
import { useContext, useMemo } from 'react';
import type { MMELJSON } from '@/smart/model/json';
import type { RepoIndex } from '@/smart/model/repo';
import { repoIndexPath } from '@/smart/model/repo';
import { getAllObjectPaths } from '@/smart/utils/repo/CommonFunctions';
import { COMMITMSG, getPathByNS, RepoFileType } from '@/smart/utils/repo/io';
import { LoadingIcon } from '@/smart/ui/common/Loading';

export interface RepoRenameAction {
  old: string;
  update: string;
}

const RepoRenameLoading: React.FC<{
  action: RepoRenameAction;
  done: () => void;
  sendMsg: (x: IToastProps) => void;
  index: RepoIndex;
}> = function ({ action, done, sendMsg, index }) {
  const { useObjectData, updateObjects } = useContext(DatasetContext);

  const paths = getAllObjectPaths(action.old);

  const modelFiles = useObjectData({
    objectPaths : paths,
  });

  useMemo(() => {
    if (!modelFiles.isUpdating) {
      if (updateObjects) {
        const changes = paths.map(x => ({
          newValue : modelFiles.value.data[x],
        }));
        const model = modelFiles.value.data[
          getPathByNS(action.old, RepoFileType.MODEL)
        ] as MMELJSON;
        if (model && model.meta) {
          model.meta.namespace = action.update;
        }
        const newPaths = getAllObjectPaths(action.update);

        const updated = { ...index };
        const item = updated[action.old];
        delete updated[action.old];
        item.namespace = action.update;
        item.date = new Date();
        updated[action.update] = item;

        const changeset: ObjectChangeset = {
          [repoIndexPath] : { newValue : updated },
        };
        newPaths.forEach((p, index) => (changeset[p] = changes[index]));
        paths.forEach(p => (changeset[p] = { newValue : null }));

        const task = updateObjects({
          commitMessage              : COMMITMSG,
          _dangerouslySkipValidation : true,
          objectChangeset            : changeset,
        });
        task.then(() => {
          sendMsg({
            message : `Done: model renamed to namespace ${action.update}`,
            intent  : 'success',
          });
          done();
        });
      } else {
        sendMsg({
          message : 'No write access to the repository',
          intent  : 'danger',
        });
        done();
      }
    }
  }, [modelFiles.isUpdating]);

  return (
    <div
      style={{
        position : 'fixed',
        right    : 30,
        bottom   : 20,
      }}
    >
      <LoadingIcon small />
    </div>
  );
};

export default RepoRenameLoading;
