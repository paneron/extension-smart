// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
import React from 'react';
import { ControlButton } from 'react-flow-renderer';
import {
  mgdControlButton,
  mgdControlButtonActive,
  mgdControlButtonInactive,
} from '../../css/MGDControlButton';

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

interface OwnProps {
  children: JSX.Element;
  isActive: boolean;
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

function MGDControlButton(props: OwnProps) {
  const { children, isActive, onClick } = props;
  const classes = {
    ...mgdControlButton,
    ...(isActive ? mgdControlButtonActive : mgdControlButtonInactive),
  };
  return (
    <ControlButton style={classes} onClick={onClick}>
      {children}
    </ControlButton>
  );
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

export default MGDControlButton;

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
