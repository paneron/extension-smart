/**
 * Contains some buttons that are reused on multiple UIs
 */

import type { IconName } from '@blueprintjs/core';
import { Icon } from '@blueprintjs/core';
import React from 'react';
import { ControlButton } from 'react-flow-renderer';

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
  return <IconControlButton {...props} icon="flows" />;
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
    <ControlButton
      style={{ backgroundColor : isOn ? 'lightgreen' : undefined }}
      onClick={onClick}
    >
      <Icon icon={icon} />
    </ControlButton>
  );
};
