/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { jsx } from '@emotion/react';
import React from 'react';
import { IUpdateInterface, NormalButton } from '../fields';

const ItemUpdatePane: React.FC<IUpdateInterface> = ({
  Content,
  object,
  setObject,
  updateButtonLabel,
  updateClicked,
  cancelClicked,
}) => {
  return (
    <>
      <Content object={object} setObject={setObject} />
      <NormalButton
        key="ui#itemupdate#updatebutton"
        text={updateButtonLabel}
        onClick={() => updateClicked()}
      />
      <NormalButton
        text="Cancel"
        key="ui#itemupdate#cancelbutton"
        onClick={() => cancelClicked()}
      />
    </>
  );
};

export default ItemUpdatePane;
