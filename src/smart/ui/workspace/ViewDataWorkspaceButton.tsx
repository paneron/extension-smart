/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { Tooltip2 } from '@blueprintjs/popover2';
import { jsx } from '@emotion/react';
import React from 'react';
import { flownode_top_right_button_layout } from '../../../css/layout';
import MGDButton from '../../MGDComponents/MGDButton';

const ViewWorkspaceButton: React.FC<{
  onClick: () => void;
}> = function ({ onClick }) {
  return (
    <div css={flownode_top_right_button_layout}>
      <Tooltip2 content="Browse documents" position="top">
        <MGDButton icon="eye-open" onClick={onClick} />
      </Tooltip2>
    </div>
  );
};

export default ViewWorkspaceButton;
