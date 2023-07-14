/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { jsx } from '@emotion/react';

import { css } from '@emotion/react';
import { DatasetContext } from '@riboseinc/paneron-extension-kit/context';
import React, { useContext, useMemo, useState } from 'react';
import { ChangeLog, createChangeLog } from '@/smart/model/changelog';
import { EditorModel } from '@/smart/model/editormodel';
import { RepoHistory } from '@/smart/model/history';
import { MMELJSON } from '@/smart/model/json';
import { indexModel, MapProfile } from '@/smart/model/mapmodel';
import { MMELToEditorModel } from '@/smart/model/modelwrapper';
import {
  ModuleList,
  ModuleName,
  MODULE_CONFIGURATION,
} from '@/smart/model/module/appModule';
import { MMELRepo, RepoIndex } from '@/smart/model/repo';
import { createNewSMARTWorkspace, SMARTWorkspace } from '@/smart/model/workspace';
import { MAPVERSION } from '@/smart/utils/constants';
import { getNamespace } from '@/smart/utils/ModelFunctions';
import * as Logger from '@/lib/logger';
import {
  getPathByNS,
  JSONContext,
  JSONToMMEL,
  RepoFileType,
} from '@/smart/utils/repo/io';
import { LoadingScreen } from '@/smart/ui/common/Loading';

/**
 * When an item (model / document) is open, its contents are loaded first here.
 * The loading screen is displayed.
 * When everything is loaded, the contents are passed to the corresponding components
 */
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
  const { useRemoteUsername } = useContext(DatasetContext);

  const [model, setModel] = useState<EditorModel | undefined>(undefined);
  const [mapping, setMapping] = useState<MapProfile | undefined>(undefined);
  const [history, setHistory] = useState<ChangeLog | undefined>(undefined);
  const [ws, setWS] = useState<SMARTWorkspace | undefined>(undefined);
  const { useObjectData } = useContext(DatasetContext);

  const repoPath = getPathByNS(repo.ns, RepoFileType.MODEL);
  const mapPath = getPathByNS(repo.ns, RepoFileType.MAP);
  const wsPath = getPathByNS(repo.ns, RepoFileType.WORKSPACE);
  const hisPath = getPathByNS(repo.ns, RepoFileType.HISTORY);
  const repoModelFile = useObjectData({
    objectPaths : [repoPath, mapPath, wsPath, hisPath],
  });
  const repoData = repoModelFile.value.data[repoPath];
  const mapData = repoModelFile.value.data[mapPath];
  const wsData = repoModelFile.value.data[wsPath];
  const hisData = repoModelFile.value.data[hisPath];

  const userData = useRemoteUsername();
  const username =
    userData === undefined ||
    userData.value === undefined ||
    userData.value.username === undefined
      ? 'Anonymous'
      : userData.value.username;

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
          Logger.error(
            `Warning: Mapping versions do not match.\nMapping version of file: ${mapPro.version}.\nExpected: ${MAPVERSION}.`
          );
          mapPro.version = MAPVERSION;
        }
        setMapping(mapPro);
      } else {
        setMapping({
          '@context' : JSONContext,
          '@type'    : 'MMEL_MAP',
          'id'       : getNamespace(model),
          'mapSet'   : {},
          'docs'     : {},
          'version'  : MAPVERSION,
        });
      }
      const workData = wsData
        ? (wsData as SMARTWorkspace)
        : createNewSMARTWorkspace();
      setWS(workData);
      const hisRepoData = hisData
        ? (hisData as ChangeLog)
        : [createChangeLog(model, username)];
      setHistory(hisRepoData);
    }
  }, [repo.ns, repoModelFile.isUpdating]);

  const modules = ModuleList[repo.type];

  return (
    <>
      {model && mapping && ws && history ? (
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
                changelog={history}
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
