/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { jsx } from '@emotion/react';
import React, { useContext, useState } from 'react';
import { Menu, MenuItem } from '@blueprintjs/core';
import { DatasetContext } from '@riboseinc/paneron-extension-kit/context';
import { MMELFactory } from '../../../runtime/modelComponentCreator';
import { StateMan } from '../../interface/state';
import { ModelWrapper } from '../../model/modelwrapper';
import { MMELToText, textToMMEL } from '../../../serialize/MMEL';
import { MMELModel } from '../../../serialize/interface/model';

const EditMenu: React.FC<{ sm: StateMan }> = function ({ sm }) {
  const [selectedPanel, selectPanel] = useState<PanelName | null>(null);

  return (
    <Menu>
      {PANEL_NAMES.map(panelName => (
        <PanelItem
          panelName={panelName}
          onSelect={() => selectPanel(panelName)}
        />
      ))}
    </Menu>
  );
};

const PanelItem: React.FC<{ panelName: PanelName, onSelect: () => void }> =
function ({ panelName, onSelect }) {
  const cfg = PANELS[panelName];
  return (
    <MenuItem
      text={cfg.title}
      title={cfg.tooltip}
    />
  );
}

export default EditMenu;

const PANEL_NAMES = [
  'meta',
  'roles',
  'references',
  'registries',
  'dataclasses',
  'enumerations',
  'variables',
] as const;

type PanelName = typeof PANEL_NAMES[number];

interface PanelConfig {
  view: React.FC<{ modelWrapper: ModelWrapper }>
  title: JSX.Element
  tooltip?: string
}

const PANELS: Record<PanelName, PanelConfig> = {
  meta: mmelToXML,
  roles: mmelToJSON,
};
