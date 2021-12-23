/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { jsx } from '@emotion/react';

import { css } from '@emotion/react';
import { DatasetContext } from '@riboseinc/paneron-extension-kit/context';
import React, { useContext, useMemo, useState } from 'react';
import { EditorModel } from '../../model/editormodel';
import { RepoHistory } from '../../model/history';
import { MMELJSON } from '../../model/json';
import { indexModel, MapProfile } from '../../model/mapmodel';
import { MMELToEditorModel } from '../../model/modelwrapper';
import {
  ModuleList,
  ModuleName,
  MODULE_CONFIGURATION,
} from '../../model/module/appModule';
import { MMELRepo, RepoIndex } from '../../model/repo';
import { createNewSMARTWorkspace, SMARTWorkspace } from '../../model/workspace';
import { MAPVERSION } from '../../utils/constants';
import { getNamespace } from '../../utils/ModelFunctions';
import {
  getPathByNS,
  JSONContext,
  JSONToMMEL,
  RepoFileType,
} from '../../utils/repo/io';
import { LoadingScreen } from '../common/Loading';

const RepoItemLoadingView: React.FC<{
  repo: MMELRepo;
  selectedModule: ModuleName;
  setRepo: (x?: MMELRepo) => void;
  index: RepoIndex;
  linktoAnotherRepo: (x: MMELRepo) => void;
  repoHis: RepoHistory;
  setRepoHis: (x: RepoHistory) => void;
  setClickListener: (f: (() => void)[]) => void;
}> = function ({
  repo,
  selectedModule,
  setRepo,
  index,
  linktoAnotherRepo,
  repoHis,
  setRepoHis,
  setClickListener,
}) {
  const [model, setModel] = useState<EditorModel | undefined>(undefined);
  const [mapping, setMapping] = useState<MapProfile | undefined>(undefined);
  const [ws, setWS] = useState<SMARTWorkspace | undefined>(undefined);
  const { useObjectData } = useContext(DatasetContext);

  const repoPath = getPathByNS(repo.ns, RepoFileType.MODEL);
  const mapPath = getPathByNS(repo.ns, RepoFileType.MAP);
  const wsPath = getPathByNS(repo.ns, RepoFileType.WORKSPACE);
  const repoModelFile = useObjectData({
    objectPaths: [repoPath, mapPath, wsPath],
  });
  const repoData = repoModelFile.value.data[repoPath];
  const mapData = repoModelFile.value.data[mapPath];
  const wsData = repoModelFile.value.data[wsPath];

  useMemo(() => {
    setModel(undefined);
    setMapping(undefined);
    setWS(undefined);
  }, [repo.ns]);

  useMemo(() => {
    if (repoData && !repoModelFile.isUpdating) {
      const json = repoData as MMELJSON;
      const model = MMELToEditorModel(JSONToMMEL(json));
      indexModel(model);
      setModel(model);
      if (mapData) {
        const mapPro = mapData as MapProfile;
        if (mapPro.version !== MAPVERSION) {
          alert(
            `Warning: Mapping version not matched\nMapping version of the file:${mapPro.version}`
          );
          mapPro.version = MAPVERSION;
        }
        setMapping(mapPro);
      } else {
        setMapping({
          '@context': JSONContext,
          '@type': 'MMEL_MAP',
          id: getNamespace(model),
          mapSet: {},
          docs: {},
          version: MAPVERSION,
        });
      }
      const workData = wsData
        ? (wsData as SMARTWorkspace)
        : createNewSMARTWorkspace();
      setWS(workData);
    }
  }, [repo.ns, repoModelFile.isUpdating]);

  const modules = ModuleList[repo.type];

  return (
    <>
      {model && mapping && ws ? (
        modules.map(moduleName => {
          const cfg = MODULE_CONFIGURATION[moduleName];
          if (cfg.type === 'model') {
            const View = cfg.view;
            return (
              <View
                key={moduleName + jsx.length}
                isVisible={selectedModule === moduleName}
                setClickListener={setClickListener}
                css={ViewCSS}
                repo={repo}
                setRepo={setRepo}
                index={index}
                linktoAnotherRepo={linktoAnotherRepo}
                repoHis={repoHis}
                setRepoHis={setRepoHis}
                model={model}
                mapping={mapping}
                ws={ws}
              />
            );
          } else if (cfg.type === 'doc') {
            const View = cfg.view;
            return (
              <View
                key={moduleName + jsx.length}
                isVisible={selectedModule === moduleName}
                css={ViewCSS}
                repo={repo}
              />
            );
          } else {
            const View = cfg.view;
            return (
              <View
                key={moduleName + jsx.length}
                isVisible={selectedModule === moduleName}
                css={ViewCSS}
                repo={repo}
                setRepo={setRepo}
                index={index}
              />
            );
          }
        })
      ) : (
        <LoadingScreen label="Loading model" />
      )}
    </>
  );
};

const ViewCSS = css`
  flex: 1;
  overflow: hidden;
`;

export default RepoItemLoadingView;
