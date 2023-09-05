import React from 'react';
import { useState } from 'react';
import type { MMELRepo, RepoIndex } from '@/smart/model/repo';
import type { RepoHistory } from '@/smart/model/history';
import AppControlBar from '@/smart/ui/app/AppControlBar';
import AppUILayout from '@/smart/ui/app/AppUI';
import ModuleButton from '@/smart/ui/app/ModuleButton';
import type { ModuleName } from '@/smart/model/module/appModule';
import { ModuleList } from '@/smart/model/module/appModule';
import RepoItemLoadingView from '@/smart/ui/app/RepoItemLoadingView';
import NeutralView from '@/smart/ui/app/NeutralView';

const RepositoryView: React.FC<{
  index: RepoIndex;
}> = function ({ index }) {
  const [repo, setRepo] = useState<MMELRepo | undefined>(undefined);
  const [selectedModule, selectModule] = useState<ModuleName>('repo');
  const [clickListener, setClickListener] = useState<(() => void)[]>([]);
  const [repoHis, setRepoHis] = useState<RepoHistory>([]);

  function onRepoChange(r: MMELRepo | undefined) {
    setRepo(r);
    if (r !== undefined) {
      setRepoHis([r]);
      selectModule(r.type === 'Doc' ? 'docViewer' : 'modelViewer');
    } else {
      setRepoHis([]);
    }
  }

  function linktoAnotherRepo(x: MMELRepo) {
    setRepo(x);
    setRepoHis([...repoHis, x]);
    if (x.type === 'Doc') {
      selectModule('docViewer');
    }
  }

  function setHis(newHis: RepoHistory) {
    if (newHis.length > 0) {
      const last = newHis[newHis.length - 1];
      setRepo(last);
      setRepoHis(newHis);
      selectModule(last.type === 'Doc' ? 'docViewer' : 'modelViewer');
    }
  }

  const modules = ModuleList[repo ? repo.type : ''];

  const toolbar = (
    <AppControlBar>
      {modules.map(moduleName => (
        <ModuleButton
          key={`${moduleName}`}
          moduleName={moduleName}
          selected={moduleName === selectedModule}
          onSelect={() => selectModule(moduleName)}
        />
      ))}
    </AppControlBar>
  );

  const props = {
    selectedModule,
    index,
    setClickListener,
    setRepo    : onRepoChange,
    linktoAnotherRepo,
    repoHis,
    setRepoHis : setHis,
  };

  return (
    <AppUILayout clickListener={clickListener}>
      {toolbar}
      {repo ? (
        <RepoItemLoadingView repo={repo} {...props} />
      ) : (
        <NeutralView {...props} />
      )}
    </AppUILayout>
  );
};

export default RepositoryView;
