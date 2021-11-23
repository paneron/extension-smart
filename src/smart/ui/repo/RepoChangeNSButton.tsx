import { Button, IToastProps } from '@blueprintjs/core';
import { Popover2, Tooltip2 } from '@blueprintjs/popover2';
import React from 'react';
import { useState } from 'react';
import { RepoIndex } from '../../model/repo';
import AskIDForSaveMenu from '../popover/AskIDForSaveMenu';

const RepoChangeNSButton: React.FC<{
  initValue: string;
  save: (id: string) => void;
  index: RepoIndex;
  sendMsg: (x: IToastProps) => void;
}> = function ({ initValue, save, index, sendMsg }) {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  function onSave(id: string) {
    save(id);
    setIsOpen(false);
  }

  return (
    <Popover2
      minimal
      placement="bottom"
      isOpen={isOpen}
      content={
        <AskIDForSaveMenu
          title="New Namespace"
          onSave={onSave}
          validTest={id => test(id, initValue, index, sendMsg)}
          initID={initValue}
        />
      }
    >
      <Tooltip2 content="Change namespace">
        <Button large icon="edit" onClick={() => setIsOpen(x => !x)} />
      </Tooltip2>
    </Popover2>
  );
};

function test(
  name: string,
  ori: string,
  index: RepoIndex,
  sendMsg: (x: IToastProps) => void
): boolean {
  if (name === ori) {
    return true;
  }
  if (name === '') {
    sendMsg({
      message: 'Invalid item: namespace is empty',
      intent: 'danger',
    });
    return false;
  }
  if (index[name] !== undefined) {
    sendMsg({
      message: 'Error: item with the same namespace already exists',
      intent: 'danger',
    });
    return false;
  }
  return true;
}

export default RepoChangeNSButton;
