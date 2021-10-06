/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { Button, IconName } from '@blueprintjs/core';
import { Popover2 } from '@blueprintjs/popover2';
import { jsx } from '@emotion/react';
import { useState } from 'react';
import AskIDForSaveMenu from './AskIDForSaveMenu';

const ImportFromSelectionButton: React.FC<{
  title: string;
  valueTitle: string;
  value: string;
  validTest: (id: string) => boolean;
  iconName: IconName;
  buttonText: string;
  save: (id: string, data: string) => void;
}> = function (props) {
  const { iconName, buttonText, save } = props;

  const [isOpen, setIsOpen] = useState<boolean>(false);

  function onSave(id: string, data: string) {
    save(id, data);
    setIsOpen(false);
  }

  return (
    <Popover2
      minimal
      placement="bottom-start"
      isOpen={isOpen}
      content={<AskIDForSaveMenu {...props} onSave={onSave} />}
    >
      <Button icon={iconName} onClick={() => setIsOpen(!isOpen)}>
        {buttonText}
      </Button>
    </Popover2>
  );
};

export default ImportFromSelectionButton;
