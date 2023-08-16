/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { jsx } from '@emotion/react';

import { css } from '@emotion/react';
import React from 'react';
import {
  ModuleList,
  ModuleName,
  MODULE_CONFIGURATION,
} from '@/smart/model/module/appModule';
import { MMELRepo, RepoIndex } from '@/smart/model/repo';

/**
 * The displayed UI when nothing is open.
 * When a model / document is open, another UI will replace this one.
 */
const NeutralView: React.FC<{
  selectedModule: ModuleName;
  setRepo: (x?: MMELRepo) => void;
  index: RepoIndex;
}> = function ({ setRepo, index, selectedModule }) {
  const modules = ModuleList[''];

  return (
    <>
      {modules.map(moduleName => {
        const cfg = MODULE_CONFIGURATION[moduleName];
        if (cfg.type === 'neutral') {
          const View = cfg.view;
          return (
            <View
              key={moduleName + jsx.length}
              isVisible={selectedModule === moduleName}
              css={css`
                flex: 1;
                overflow: hidden;
              `}
              setRepo={setRepo}
              index={index}
            />
          );
        } else {
          return '';
        }
      })}
    </>
  );
};

export default NeutralView;
