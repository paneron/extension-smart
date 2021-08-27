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
import ModelEditor from './smart/ui/maineditor';
import ModelMapper from './smart/ui/mainmapper';
import { BSI_WHITE_TEXT } from './css/BSI.logos';
import ModelViewer from './smart/ui/mainviewer';

const RepositoryView: React.FC<Record<never, never>> = function () {
  const [selectedModule, selectModule] = useState<ModuleName>('modelViewer');

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
    >
      {toolbar}
      {MODULES.map(moduleName => {
        const cfg = MODULE_CONFIGURATION[moduleName];
        const View = cfg.view;
        const selected = selectedModule === moduleName;
        return (
          <View
            isVisible={selected}
            css={css`
              flex: 1;
              overflow: hidden;
            `}
          />
        );
      })}
    </div>
  );
};

export default RepositoryView;

const MODULES = ['modelViewer', 'modelEditor', 'modelMapper'] as const;

type ModuleName = typeof MODULES[number];

interface ModuleConfiguration {
  title: JSX.Element;
  description: JSX.Element;
  tooltip: string;
  icon: IconName;
  view: React.FC<{ isVisible: boolean; className?: string }>;
}

const MODULE_CONFIGURATION: Record<ModuleName, ModuleConfiguration> = {
  modelViewer: {
    title: <>View</>,
    description: <>Model viewer</>,
    tooltip: 'Model viewer',
    icon: 'eye-open',
    view: ModelViewer,
  },
  modelEditor: {
    title: <>Edit</>,
    description: <>Model editor</>,
    tooltip: 'Model editor',
    icon: 'edit',
    view: ModelEditor,
  },
  modelMapper: {
    title: <>Map</>,
    description: <>Model mapper</>,
    tooltip: 'Model mapper',
    icon: 'data-lineage',
    view: ModelMapper,
  }, 
};

const ModuleButton: React.FC<{
  moduleName: ModuleName;
  selected: boolean;
  onSelect: () => void;
}> = function ({ moduleName, selected, onSelect }) {
  const cfg = MODULE_CONFIGURATION[moduleName];

  return (
    <Tooltip2
      content={cfg.description}
      css={css`
        margin-top: -2px;
      `}
    >
      <Button
        large
        intent="primary"
        active={selected}
        onClick={onSelect}
        icon={cfg.icon}
        title={cfg.tooltip}
      />
    </Tooltip2>
  );
};
