import { Button, IconName, Intent, PopoverPosition } from '@blueprintjs/core';
import { Classes, Tooltip2 } from '@blueprintjs/popover2';
import React from 'react';

export const RemoveButton: React.FC<{
  onClick: () => void;
}> = function ({ onClick }) {
  return (
    <BaseButton
      tooltip="Remove Component"
      icon="cross"
      intent="danger"
      onClick={onClick}
    />
  );
};

export const EditButton: React.FC<{
  onClick: () => void;
}> = function ({ onClick }) {
  return (
    <BaseButton tooltip="More editing options" icon="more" onClick={onClick} />
  );
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

export const AddSubprocessButton: React.FC<{
  callback: () => void;
}> = function ({ callback }) {
  return (
    <Tooltip2 content="Add subprocess">
      <Button icon="map-create" onClick={callback} />;
    </Tooltip2>
  );
};

export const RemoveSubprocessButton: React.FC<{
  callback: () => void;
}> = function ({ callback }) {
  return (
    <Tooltip2 content="Remove subprocess">
      <Button icon="map" intent="danger" onClick={callback} />;
    </Tooltip2>
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
  icon: IconName;
  position?: PopoverPosition;
  className?: string;
  onClick: () => void;
  intent?: Intent;
}> = function ({ tooltip, text, intent, icon, position, className, onClick }) {
  if (tooltip === undefined) {
    return <Button icon={icon} intent={intent} onClick={onClick} />;
  } else {
    return (
      <Tooltip2 content={tooltip} position={position}>
        <Button
          className={className}
          intent={intent}
          icon={icon}
          onClick={onClick}
        >
          {text}
        </Button>
      </Tooltip2>
    );
  }
};
