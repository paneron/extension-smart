import { DatasetContext } from '@riboseinc/paneron-extension-kit/context';
import React, { useContext, useMemo } from 'react';
import { MMELJSON } from '@/smart/model/json';
import {
  createEditorModelWrapper,
  ModelWrapper,
} from '../../../model/modelwrapper';
import { MMELRepo, RepoIndex } from '@/smart/model/repo';
import { getAllRepoModels } from '@/smart/utils/repo/CommonFunctions';
import { JSONToMMEL } from '@/smart/utils/repo/io';
import { LoadingScreen } from '@/smart/ui/common/Loading';
import RepoIndexDiagram from '@/smart/ui/mapper/repo/RepoIndexDiagram';

const RepoIndexMainView: React.FC<{
  repo?: MMELRepo;
  index: RepoIndex;
}> = function ({ repo, index }) {
  const { useObjectData } = useContext(DatasetContext);

  const modelFiles = useObjectData({
    objectPaths : getAllRepoModels(index),
  });

  const models: Record<string, ModelWrapper> | undefined = useMemo(() => {
    if (!modelFiles.isUpdating) {
      return Object.entries(modelFiles.value.data).reduce<
        Record<string, ModelWrapper>
      >(
        (obj, [ns, x]) =>
          x !== null
            ? {
              ...obj,
              [ns] : createEditorModelWrapper(JSONToMMEL(x as MMELJSON)),
            }
            : obj,
        {}
      );
    }
    return undefined;
  }, [modelFiles.isUpdating]);

  return (
    <>
      {repo === undefined || modelFiles.isUpdating ? (
        LoadingAnalysis
      ) : (
        <RepoIndexDiagram index={index} models={models} repo={repo} />
      )}
    </>
  );
};

const LoadingAnalysis = LoadingScreen({ label : 'Loading model information' });

export default RepoIndexMainView;
