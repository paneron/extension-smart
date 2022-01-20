import { Button, FormGroup } from '@blueprintjs/core';
import React from 'react';
import MGDButtonGroup from '../../../MGDComponents/MGDButtonGroup';
import MGDDisplayPane from '../../../MGDComponents/MGDDisplayPane';
import { IUpdateInterface } from '../fields';

const ItemUpdatePane = <T extends Object>(props: IUpdateInterface<T>) => {
  const {
    Content,
    object,
    setObject,
    model,
    table,
    updateButtonLabel,
    updateButtonIcon,
    updateClicked,
    cancelClicked,
    isVisible,
    oldid,
  } = props;
  if (isVisible) {
    return (
      <MGDDisplayPane>
        <FormGroup>
          <Content
            object={object}
            setObject={setObject}
            model={model}
            table={table}
            oldid={oldid}
          />
          <MGDButtonGroup>
            <Button icon={updateButtonIcon} onClick={() => updateClicked()}>
              {updateButtonLabel}
            </Button>
            <Button icon="disable" onClick={() => cancelClicked()}>
              Cancel
            </Button>
          </MGDButtonGroup>
        </FormGroup>
      </MGDDisplayPane>
    );
  } else {
    return <></>;
  }
};

export default ItemUpdatePane;
