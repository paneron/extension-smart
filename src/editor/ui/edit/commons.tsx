import { Button, ButtonGroup, Intent } from "@blueprintjs/core";
import React from "react";

export const EditPageButtons: React.FC<{
  onUpdateClick: () => void;
  onCancelClick: () => void;
}> = function ({ onUpdateClick, onCancelClick}) {
  return (
    <ButtonGroup style={{ textAlign: 'right' }}>
      <Button
        key="ui#itemupdate#savebutton"
        icon='floppy-disk'
        intent={Intent.SUCCESS}
        text='Save'
        onClick={() => onUpdateClick()}                  
      />
      <Button
        key="ui#itemupdate#cancelbutton"
        icon="disable"
        intent={Intent.DANGER}
        text="Cancel"
        onClick={() => onCancelClick()}
      />
    </ButtonGroup>    
  )
}