import React from 'react';
import { useState } from 'react';
import { MMELRepo, RepoIndex } from '../../model/repo';
import { RepoHistory } from '../../model/history';
import AppControlBar from './AppControlBar';
import AppUILayout from './AppUI';
import ModuleButton from './ModuleButton';
import { ModuleList, ModuleName } from '../../model/module/appModule';
import RepoItemLoadingView from './RepoItemLoadingView';
import NeutralView from './NeutralView';

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
