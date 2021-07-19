/** @jsx jsx */
/** @jsxFrag React.Fragment */

import log from 'electron-log';
import React from 'react';
import { jsx, css } from '@emotion/react';
import {
  Button,
  Classes,
  Colors,
  ControlGroup,
  IconName,
} from '@blueprintjs/core';
import { Tooltip2 } from '@blueprintjs/popover2';
import ModelEditor from './editor/ui/maineditor';
import ModelMapper from './editor/ui/mapper/mappermain';
import { useState } from 'react';

Object.assign(console, log);

const RepositoryView: React.FC<Record<never, never>> = function () {
  const [selectedModule, selectModule] = useState<ModuleName>('modelEditor');

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
        dangerouslySetInnerHTML={{ __html: BSI_SVG }}
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

const MODULES = ['modelEditor', 'modelMapper'] as const;

type ModuleName = typeof MODULES[number];

interface ModuleConfiguration {
  title: JSX.Element;
  description: JSX.Element;
  tooltip: string;
  icon: IconName;
  view: React.FC<{ isVisible: boolean; className?: string }>;
}

const MODULE_CONFIGURATION: Record<ModuleName, ModuleConfiguration> = {
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

const BSI_SVG = `
  <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 53 32"><defs><style>.cls-1{isolation:isolate;}</style></defs><title>bsi</title><g id="Layer_2" data-name="Layer 2"><g id="Layer_1-2" data-name="Layer 1"><image class="cls-1" width="53" height="32" xlink:href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADUAAAAgCAYAAACy/TBYAAAACXBIWXMAAAsSAAALEgHS3X78AAACwElEQVRYR9WY0XHbMAxAX3odQCMoE9TdQJ4g6QSxJ2g8QZ0Jkk4Qd4KkE1idwOoE1gb2BugHyJMsgTQtOWf33eGkg0jaEEAA1I2ICIeUwJT/mE/HBlyQJbAFdsArkEVHt5E+axHhwrKUPpuEeYjI1Xrqu6GbAIWh73GtRqWHmsG1GlUF9HVAf8C1GjUH9h3dgkSjPh8bcCEq4BaYoaH4Tth7Pa7VKFBPvRwbZJEafhmafc5BwchEcIyQpzLU9Xf00+ge7Tp+umuMAnhw1zwwpnLyGw0z0Bf4bIxbkIJR5HZOUngVuwBmIvIWnhbEzy+MZ2uxf6snlqdOCY2Zu847+jXnC9eTSd1TMWYchugjFzQIwkb5zPMN+Iqm1ylNzHf50bq3WpwK9eYtcONkiq7/xAnpOgkjdjeieyIUs0tjjohI7p532Ul8PS95637UnrI8tadfzdsssSt7gR12FfH1PPWxAakM3VNWGObYYZRzWvIZzdCO4q+h+2LoQI3aAL9o6lqq9wYx1FO1ofPeWBnPcjSZrJ3snLzR9HdnY6hRMZ5I80IG3KNH9S2JB8AUPsKoGi0DZXzYARlnLNgfYRSoYVO0Li3QkCw57sF2vRvM0ESRGzrrD9fYx4cCNaAw9KMZ6ikr01kZMUSJdhPdF3GWhDHUqHtDVxu6GHvGt0cZ6t2irbSMyoi/sSV2+JXumrrZJ4wLtwmaNX2Z2Dqduaf84BXwB32jtdM/YHuppPHUxt2X6Hyvr2gMvqM5trR5N3SeCTqnRNd84/Dl5053azWgQyikaSjHMBNdI4uMWYrd8HqyoXuqzYrTalKIFU03sie+ZrQ0dI1aEA+BLiv6p94hvNBfZ044+VTYSaYE9jh3emmfbZ5Fz1ZddqLfH9oh15aJiDyKnn+2xnzPWvQ3cgmfjTJp1vLfTXyITpy+vV4mIvwD0GwSTcdZUxUAAAAASUVORK5CYII="/></g></g></svg>
`;
