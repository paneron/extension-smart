import { Button } from '@blueprintjs/core';
import { Tooltip2 } from '@blueprintjs/popover2';
import React from 'react';
import { ModuleName, MODULE_CONFIGURATION } from '../../model/module/appModule';

/**
 * The buttons on the leftmost button bar
 */

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

export default ModuleButton;
