import { IconName, PopoverPosition } from '@blueprintjs/core';
import { Classes, Tooltip2 } from '@blueprintjs/popover2';
import React from 'react';
import { MGDButtonType } from '../../../css/MGDButton';
import MGDButton from '../../MGDComponents/MGDButton';

export const RemoveButton: React.FC<{
  onClick: () => void;
}> = function ({ onClick }) {
  return (
    <BaseButton
      tooltip="Remove Component"
      type={MGDButtonType.Primary}
      icon="cross"
      onClick={onClick}
    />
  );
};

export const EditButton: React.FC<{
  onClick: () => void;
}> = function ({ onClick }) {
  return <BaseButton tooltip="Edit Component" icon="edit" onClick={onClick} />;
};

export const EditMappingButton: React.FC<{
  onClick: () => void;
}> = function ({ onClick }) {
  return (
    <BaseButton
      tooltip="Edit Mapping"
      className={Classes.POPOVER2_DISMISS}
      icon="edit"
      position="top"
      onClick={onClick}
    />
  );
};

export const MapPartnerNavigateButton: React.FC<{
  onClick: () => void;
}> = function ({ onClick }) {
  return (
    <BaseButton
      tooltip="Locate target"
      className={Classes.POPOVER2_DISMISS}
      icon="locate"
      position="top"
      onClick={onClick}
    />
  );
};

const BaseButton: React.FC<{
  tooltip?: string;
  text?: string;
  type?: MGDButtonType;
  icon: IconName;
  position?: PopoverPosition;
  className?: string;
  onClick: () => void;
}> = function ({ tooltip, text, type, icon, position, className, onClick }) {
  if (tooltip === undefined) {
    return <MGDButton icon={icon} onClick={onClick} />;
  } else {
    return (
      <Tooltip2 content={tooltip} position={position}>
        <MGDButton
          className={className}
          type={type}
          icon={icon}
          onClick={onClick}
        >
          {text}
        </MGDButton>
      </Tooltip2>
    );
  }
};
