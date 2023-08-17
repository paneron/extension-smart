/** @jsx jsx */

import { jsx } from '@emotion/react';
import { FocusStyleManager, HotkeysProvider } from '@blueprintjs/core';
import { DatasetContext } from '@riboseinc/paneron-extension-kit/context';
import React from 'react';
import { useContext, useMemo, useState } from 'react';
import RepositoryView from '@/smart/ui/app/RepoView';
import { RepoIndex, repoIndexPath } from '@/smart/model/repo';
import { LoadingScreen } from '@/smart/ui/common/Loading';
import { createEmptyIndex } from '@/smart/utils/repo/CommonFunctions';

const MainExtension: React.FC<Record<never, never>> = function () {
  const { useObjectData } = useContext(DatasetContext);
  const [index, setIndex] = useState<RepoIndex | undefined>(undefined);

  FocusStyleManager.onlyShowFocusOnTabs();

  const indexFile = useObjectData({ objectPaths : [repoIndexPath]});
  const data = indexFile.value.data[repoIndexPath];

  useMemo(() => {
    if (!indexFile.isUpdating) {
      if (data) {
        setIndex(data);
      } else if (index === undefined) {
        setIndex(createEmptyIndex());
      }
    }
  }, [indexFile.isUpdating, data]);

  return (
    <HotkeysProvider>
      {index ? (
        <RepositoryView index={index} />
      ) : (
        <LoadingScreen label="Loading index" />
      )}
    </HotkeysProvider>
  );
};

export default MainExtension;
