/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { jsx } from '@emotion/react';
import { Icon, IconName } from '@blueprintjs/core';
import MGDControlButton from '../../MGDComponents/MGDControlButton';

export const DataVisibilityButton: React.FC<{
  isOn: boolean;
  onClick: () => void;
}> = function ({ isOn, onClick }) {
  return <IconControlButton isOn={isOn} onClick={onClick} icon="cube" />;
};

export const EdgeEditButton: React.FC<{
  isOn: boolean;
  onClick: () => void;
}> = function ({ isOn, onClick }) {
  return <IconControlButton isOn={isOn} onClick={onClick} icon="link" />;
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
