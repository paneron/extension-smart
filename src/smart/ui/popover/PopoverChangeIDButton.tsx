import { Popover2, Tooltip2 } from '@blueprintjs/popover2';
import React from 'react';
import { useState } from 'react';
import MGDButton from '../../MGDComponents/MGDButton';
import AskIDForSaveMenu from './AskIDForSaveMenu';

const PopoverChangeIDButton: React.FC<{
  initValue: string;
  validTest: (id: string) => boolean;
  save: (id: string) => void;
}> = function ({ initValue, validTest, save }) {
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
          title="New ID"
          onSave={onSave}
          validTest={validTest}
          initID={initValue}
        />
      }
    >
      <Tooltip2 content="Change ID">
        <MGDButton icon="edit" onClick={() => setIsOpen(x => !x)} />
      </Tooltip2>
    </Popover2>
  );
};

export default PopoverChangeIDButton;
