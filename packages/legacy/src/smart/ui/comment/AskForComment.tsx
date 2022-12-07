import { Button, ButtonGroup } from '@blueprintjs/core';
import React, { useState } from 'react';
import { popoverPanelContainer } from '../../../css/layout';
import { NormalTextField } from '../common/fields';

const AskForComment: React.FC<{
  onSubmit: (msg: string) => void;
  onCancel: () => void;
}> = function ({ onSubmit, onCancel }) {
  const [msg, setMsg] = useState<string>('');

  return (
    <div style={popoverPanelContainer}>
      <NormalTextField text="Message" value={msg} onChange={x => setMsg(x)} />
      <ButtonGroup fill>
        <Button onClick={() => onSubmit(msg)}>Submit</Button>
        <Button onClick={onCancel}>Cancel</Button>
      </ButtonGroup>
    </div>
  );
};

export default AskForComment;
