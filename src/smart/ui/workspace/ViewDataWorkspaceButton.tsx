import { Button } from '@blueprintjs/core';
import { Tooltip2 } from '@blueprintjs/popover2';
import React from 'react';
import { flownodeTopRightButtonLayout } from '@/css/layout';

const ViewWorkspaceButton: React.FC<{
  onClick: () => void;
}> = function ({ onClick }) {
  return (
    <div style={flownodeTopRightButtonLayout}>
      <Tooltip2 content="Browse documents" position="top">
        <Button icon="eye-open" onClick={onClick} />
      </Tooltip2>
    </div>
  );
};

export default ViewWorkspaceButton;
