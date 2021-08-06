import { Icon, IconName } from '@blueprintjs/core';
import React, { CSSProperties } from 'react';
import { ControlButton } from 'react-flow-renderer';

export const CustomizedControlButton: React.FC<{
  isOn: boolean;
  onClick: () => void;
  icon: string;
}> = function ({ isOn, onClick, icon }) {
  return (
    <ControlButton style={getStyle(isOn)} onClick={onClick}>
      <Icon icon={icon as IconName} />
    </ControlButton>
  );
};

function getStyle(on: boolean): CSSProperties {
  return on ? { background: '#3d3' } : {};
}
