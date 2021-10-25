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
  IconName,
} from '@blueprintjs/core';
import { Tooltip2 } from '@blueprintjs/popover2';
import ModelMapper from './smart/ui/mainmapper';
import { BSI_WHITE_TEXT } from './css/BSI.logos';
import ModelViewer from './smart/ui/mainviewer';
import ModelWorkspace from './smart/ui/modelWorkspace';
import { FocusStyleManager } from '@blueprintjs/core';
import EditWrapper from './smart/ui/editFunctions/EditWrapper';
import { MMELRepo } from './smart/model/repo';
import RepoViewer from './smart/ui/repo/RepoViewer';

const RepositoryView: React.FC<Record<never, never>> = function () {
  const [repo, setRepo] = useState<MMELRepo | undefined>(undefined);
  const [selectedModule, selectModule] = useState<ModuleName>('repo');
  const [clickListener, setClickListener] = useState<(() => void)[]>([]);

  function onRepoChange(r: string | undefined) {
    setRepo(r);
    if (r !== undefined) {
      selectModule('modelViewer');
    }
  }

  FocusStyleManager.onlyShowFocusOnTabs();

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
      {MODULES.map(moduleName => (
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
      {MODULES.map(moduleName => {
        const cfg = MODULE_CONFIGURATION[moduleName];
        const View = cfg.view;
        const selected = selectedModule === moduleName;
        return (
          <View
            isVisible={selected}
            setClickListener={setClickListener}
            css={css`
              flex: 1;
              overflow: hidden;
            `}
            repo={repo}
            setRepo={onRepoChange}
          />
        );
      })}
    </div>
  );
};

export default RepositoryView;

const MODULES = [
  'repo',
  'modelViewer',
  'modelEditor',
  'modelMapper',
  'modelImplement',
] as const;

type ModuleName = typeof MODULES[number];

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
