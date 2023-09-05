import { Button } from '@blueprintjs/core';
import React, { useState } from 'react';
import { popoverPanelContainer } from '@/css/layout';
import { removeSpace } from '@/smart/utils/ModelFunctions';
import { NormalTextField } from '@/smart/ui/common/fields';

const AskIDForSaveMenu: React.FC<{
  title: string;
  initID?: string;
  valueTitle?: string;
  value?: string;
  validTest: (id: string) => boolean;
  onSave: (id: string, data: string) => void;
  buttonText?: string;
}> = function (props) {
  const { title, validTest, onSave, valueTitle, initID, value, buttonText } =
    props;
  const [id, setID] = useState<string>(initID ?? '');
  const [data, setData] = useState<string>(value ?? '');

  function handleSave() {
    if (validTest(id)) {
      onSave(id, data);
    }
  }

  return (
    <div style={popoverPanelContainer}>
      <NormalTextField
        text={title}
        value={id}
        onChange={x => setID(removeSpace(x))}
      />
      {value !== undefined && (
        <NormalTextField
          text={valueTitle}
          value={data}
          onChange={x => setData(x)}
        />
      )}
      <Button intent="primary" fill onClick={handleSave}>
        {buttonText ?? 'Save'}
      </Button>
    </div>
  );
};

export default AskIDForSaveMenu;
