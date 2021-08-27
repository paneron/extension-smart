import { Icon, IconName } from '@blueprintjs/core';
import { Tooltip2 } from '@blueprintjs/popover2';
import React from 'react';
import MGDControlButton from '../../MGDComponents/MGDControlButton';

export const DataVisibilityButton: React.FC<{
  isOn: boolean;
  onClick: () => void;  
}> = function ({isOn, onClick}) {
  return (
    <IconControlButton 
      isOn={isOn}
      onClick={onClick}
      icon='cube'
      tooltip='Show data'
    />
  )  
}

export const EdgeEditButton: React.FC<{
  isOn: boolean;
  onClick: () => void;  
}> = function ({isOn, onClick}) {
  return (
    <IconControlButton
      isOn={isOn}
      onClick={onClick}
      icon='link'
      tooltip='Edit edge'
    />
  )  
}

const IconControlButton: React.FC<{
  isOn: boolean;
  onClick: () => void;
  icon: IconName;
  tooltip?: string;
}> = function ({ isOn, onClick, icon, tooltip }) {
  return (    
    <MGDControlButton isActive={isOn} onClick={onClick}>
      <Tooltip2 content={tooltip} position='right'>
        <Icon icon={icon} />
      </Tooltip2>
    </MGDControlButton>    
  );
};
