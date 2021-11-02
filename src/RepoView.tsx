/** @jsx jsx */
/** @jsxFrag React.Fragment */

import React from 'react';
import { useState } from 'react';
import { jsx, css } from '@emotion/react';
import {
  Button,
  Classes,
  Colors,
  ControlGroup,
  HotkeysProvider,
  HotkeysTarget2,
  IconName,
} from '@blueprintjs/core';
import { Tooltip2 } from '@blueprintjs/popover2';
import ModelMapper from './smart/ui/mainmapper';
import { BSI_WHITE_TEXT } from './css/BSI.logos';
import ModelViewer from './smart/ui/mainviewer';
import ModelWorkspace from './smart/ui/modelWorkspace';
import EditWrapper from './smart/ui/editFunctions/EditWrapper';
import { MMELRepo, RepoIndex, RepoItemType } from './smart/model/repo';
import RepoViewer from './smart/ui/repo/RepoViewer';
import DocumentViewer from './smart/ui/docviewer';
import { RepoHistory } from './smart/model/history';
import LinkAnalysis from './smart/ui/LinkAnalysis';

const RepositoryView: React.FC<{
  index: RepoIndex;
}> = function ({ index }) {
  const [repo, setRepo] = useState<MMELRepo | undefined>(undefined);
  const [selectedModule, selectModule] = useState<ModuleName>('repo');
  const [clickListener, setClickListener] = useState<(() => void)[]>([]);
  const [isBSI, setIsBSI] = useState<boolean>(false);
  const [repoHis, setRepoHis] = useState<RepoHistory>([]);

  const hotkeys = [
    {
      combo: 'ctrl+b',
      global: true,
      label: 'BSI',
      onKeyDown: () => setIsBSI(x => !x),
    },
  ];

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

  function popHis() {
    const newHis = [...repoHis];
    newHis.pop();
    if (newHis.length > 0) {
      const last = newHis[newHis.length - 1];
      setRepo(last);
      setRepoHis(newHis);
      selectModule(last.type === 'Doc' ? 'docViewer' : 'modelViewer');
    }
  }

  const modules = ModuleList[repo ? repo.type : ''];

  const toolbar = (
    <ControlGroup
      vertical
      className={Classes.ELEVATION_3}
      css={css`
        z-index: 14;
        background: ${Colors.BLUE3};
        width: 32px;
        align-items: center;
        overflow: hidden;
      `}
    >
      <div
        className={Classes.ELEVATION_2}
        css={css`
          z-index: 14;
          margin-bottom: -2px !important;
          padding: 7px;
          height: 24px;
          display: flex;
          flex-flow: column nowrap;
          align-items: center;
          align-self: stretch;
          justify-content: center;
          overflow: hidden;
          background: black;
          color: white;
          font-weight: bold;
          border-radius: 0 !important;
          letter-spacing: -0.05em;
        `}
        dangerouslySetInnerHTML={{ __html: BSI_WHITE_TEXT }}
      />
      {modules.map(moduleName => (
        <ModuleButton
          key={moduleName}
          moduleName={moduleName}
          selected={moduleName === selectedModule}
          onSelect={() => selectModule(moduleName)}
        />
      ))}
    </ControlGroup>
  );

  return (
    <HotkeysProvider>
      <HotkeysTarget2 hotkeys={hotkeys}>
        <div
          css={css`
            flex: 1;
            overflow: hidden;
            display: flex;
            flex-flow: row nowrap;
          `}
          onMouseUp={() => {
            for (const x of clickListener) {
              x();
            }
          }}
        >
          {toolbar}
          {modules.map(moduleName => {
            const cfg = MODULE_CONFIGURATION[moduleName];
            const View = cfg.view;
            return (
              <View
                key={moduleName}
                isVisible={selectedModule === moduleName}
                setClickListener={setClickListener}
                css={css`
                  flex: 1;
                  overflow: hidden;
                `}
                repo={repo}
                setRepo={onRepoChange}
                isBSI={isBSI}
                index={index}
                linktoAnotherRepo={linktoAnotherRepo}
                popHis={repoHis.length > 1 ? popHis : undefined}
              />
            );
          })}
        </div>
      </HotkeysTarget2>
    </HotkeysProvider>
  );
};

const MODULES = [
  'repo',
  'modelViewer',
  'modelEditor',
  'modelMapper',
  'modelImplement',
  'docViewer',
  'linkAnalysis',
] as const;

type ModuleName = typeof MODULES[number];

const ModuleList: Record<RepoItemType | '', ModuleName[]> = {
  '': ['repo', 'modelViewer', 'modelEditor', 'modelMapper', 'modelImplement'],
  Doc: ['repo', 'docViewer'],
  Ref: ['repo', 'modelViewer', 'modelMapper', 'modelImplement', 'linkAnalysis'],
  Imp: [
    'repo',
    'modelViewer',
    'modelEditor',
    'modelMapper',
    'modelImplement',
    'linkAnalysis',
  ],
};

interface ModuleConfiguration {
  title: string;
  description: string;
  icon: IconName;
  view: React.FC<{
    isVisible: boolean;
    className?: string;
    setClickListener: (f: (() => void)[]) => void;
    repo?: MMELRepo;
    setRepo: (x?: MMELRepo) => void;
    isBSI: boolean;
    index: RepoIndex;
    linktoAnotherRepo: (x: MMELRepo) => void;
    popHis?: () => void;
  }>;
}

const MODULE_CONFIGURATION: Record<ModuleName, ModuleConfiguration> = {
  repo: {
    title: 'Repository',
    description: 'Model repository',
    icon: 'projects',
    view: RepoViewer,
  },
  modelViewer: {
    title: 'View',
    description: 'Model viewer',
    icon: 'eye-open',
    view: ModelViewer,
  },
  modelEditor: {
    title: 'Edit',
    description: 'Model editor',
    icon: 'edit',
    view: EditWrapper,
  },
  modelMapper: {
    title: 'Map',
    description: 'Model mapper',
    icon: 'data-lineage',
    view: ModelMapper,
  },
  modelImplement: {
    title: 'Implementation',
    description: 'Model implementation',
    icon: 'unarchive',
    view: ModelWorkspace,
  },
  docViewer: {
    title: 'Document viewer',
    description: 'Document viewer',
    icon: 'document-open',
    view: DocumentViewer,
  },
  linkAnalysis: {
    title: 'Link Analyser',
    description: 'Analyse links between models',
    icon: 'predictive-analysis',
    view: LinkAnalysis,
  },
};

const ModuleButton: React.FC<{
  moduleName: ModuleName;
  selected: boolean;
  onSelect: () => void;
}> = function ({ moduleName, selected, onSelect }) {
  const cfg = MODULE_CONFIGURATION[moduleName];

  return (
    <Tooltip2 content={cfg.description}>
      <Button
        large
        intent="primary"
        active={selected}
        onClick={onSelect}
        icon={cfg.icon}
      />
    </Tooltip2>
  );
};

export default RepositoryView;
