/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { Button } from '@blueprintjs/core';
import { jsx } from '@emotion/react';
import React, { useState } from 'react';
import { popover_panel_container } from '../../../css/layout';
import { NormalTextField } from '../common/fields';

const AskIDForSaveMenu: React.FC<{
  title: string;
  valueTitle: string;
  value: string;
  validTest: (id: string) => boolean;
  onSave: (id: string, data: string) => void;
}> = function (props) {
  const { title, validTest, onSave, valueTitle, value } = props;
  const [id, setID] = useState<string>('');
  const [data, setData] = useState<string>(value);

  function handleSave() {
    if (validTest(id)) {
      onSave(id, data);
    }
  }

  return (
    <div css={popover_panel_container}>
      <NormalTextField text={title} value={id} onChange={x => setID(x)} />
      <NormalTextField
        text={valueTitle}
        value={data}
        onChange={x => setData(x)}
      />
      <Button intent="primary" fill onClick={handleSave}>
        Save
      </Button>
    </div>
  );
};

export default AskIDForSaveMenu;
