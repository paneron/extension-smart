/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { Button, ButtonGroup, Intent } from '@blueprintjs/core';
import { jsx } from '@emotion/react';
import React from 'react';
import { IUpdateInterface } from '../fields';

const ItemUpdatePane: React.FC<IUpdateInterface> = ({
  Content,
  object,
  setObject,
  model,
  updateButtonLabel,
  updateButtonIcon,
  updateClicked,
  cancelClicked,
}) => {
  return (
    <>
      <Content object={object} setObject={setObject} model={model} />
      <ButtonGroup>
        <Button
          key="ui#itemupdate#updatebutton"
          icon={updateButtonIcon}
          intent={Intent.SUCCESS}
          text={updateButtonLabel}
          onClick={() => updateClicked()}
        />
        <Button
          key="ui#itemupdate#cancelbutton"
          icon="disable"
          intent={Intent.DANGER}
          text="Cancel"
          onClick={() => cancelClicked()}
        />
      </ButtonGroup>
    </>
  );
};

export default ItemUpdatePane;
