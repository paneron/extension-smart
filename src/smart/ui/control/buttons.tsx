import { Icon, IconName } from '@blueprintjs/core';
import React from 'react';
import MGDControlButton from '../../MGDComponents/MGDControlButton';

export const IconControlButton: React.FC<{
  isOn: boolean;
  onClick: () => void;
  icon: string;
}> = function ({ isOn, onClick, icon }) {
  return (
    <MGDControlButton isActive={isOn} onClick={onClick}>
      <Icon icon={icon as IconName} />
    </MGDControlButton>
  );
};
