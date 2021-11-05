import { Icon, IconName } from '@blueprintjs/core';
import React from 'react';
import MGDControlButton from '../../MGDComponents/MGDControlButton';

interface IconControlInterface {
  isOn: boolean;
  onClick: () => void;
}

export const DataVisibilityButton: React.FC<IconControlInterface> = function (
  props
) {
  return <IconControlButton {...props} icon="cube" />;
};

export const EdgeEditButton: React.FC<IconControlInterface> = function (props) {
  return <IconControlButton {...props} icon="link" />;
};

export const IdVisibleButton: React.FC<IconControlInterface> = function (
  props
) {
  return <IconControlButton {...props} icon="id-number" />;
};

const IconControlButton: React.FC<{
  isOn: boolean;
  onClick: () => void;
  icon: IconName;
}> = function ({ isOn, onClick, icon }) {
  return (
    <MGDControlButton isActive={isOn} onClick={onClick}>
      <Icon icon={icon} />
    </MGDControlButton>
  );
};
