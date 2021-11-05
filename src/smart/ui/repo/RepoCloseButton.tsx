import { Button } from '@blueprintjs/core';
import React from 'react';

const RepoCloseButton: React.FC<{
  onClose: () => void;
}> = function ({ onClose }) {
  return (
    <Button style={{ marginLeft: 10 }} onClick={onClose}>
      Close model
    </Button>
  );
};

export default RepoCloseButton;
