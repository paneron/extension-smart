/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { FormGroup } from '@blueprintjs/core';
import { jsx } from '@emotion/react';
import React from 'react';
import MGDButton from '../../../MGDComponents/MGDButton';
import MGDButtonGroup from '../../../MGDComponents/MGDButtonGroup';
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
    <FormGroup>
      <Content object={object} setObject={setObject} model={model} />
      <MGDButtonGroup>
        <MGDButton
          icon={updateButtonIcon}          
          onClick={() => updateClicked()}
        >
          {updateButtonLabel}
        </MGDButton>
        <MGDButton          
          icon="disable"          
          onClick={() => cancelClicked()}
        >
          Cancel
        </MGDButton>
      </MGDButtonGroup>
    </FormGroup>
  );
};

export default ItemUpdatePane;
