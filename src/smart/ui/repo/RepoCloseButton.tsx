/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { jsx } from '@emotion/react';
import { Button } from '@blueprintjs/core';

const RepoCloseButton: React.FC<{
  onClose: () => void;
}> = function ({ onClose }) {
  return <Button onClick={onClose}>Close model</Button>;
};

export default RepoCloseButton;
