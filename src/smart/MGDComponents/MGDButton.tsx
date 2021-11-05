// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { jsx } from '@emotion/react';

import { Button, IconName } from '@blueprintjs/core';
import {
  mgdButton,
  MGDButtonSize,
  mgdButtonText,
  MGDButtonType,
  mgdButtonSize,
  mgd_button_type,
} from '../../css/MGDButton';
import React from 'react';

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

interface OwnProps {
  type?: MGDButtonType;
  size?: MGDButtonSize;
  children?: string;
  icon?: IconName;
  rightIcon?: IconName;
  id?: string;
  onClick?: (e: React.MouseEvent<HTMLElement>) => void;
  disabled?: boolean;
  onMouseEnter?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  onMouseLeave?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  className?: string;
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

function MGDButton(props: OwnProps) {
  const {
    type = MGDButtonType.Tertiary,
    size = MGDButtonSize.Small,
    children,
    id = '',
    onClick,
    disabled,
    icon,
    rightIcon,
    onMouseEnter,
    onMouseLeave,
    className,
  } = props;
  const buttonStyle = {
    ...mgdButton,
    ...mgdButtonSize[size],
  };
  return (
    <Button
      outlined
      small={size === MGDButtonSize.Small}
      id={id}
      style={buttonStyle}
      css={mgd_button_type[type]}
      onClick={onClick}
      disabled={disabled}
      className={className}
      icon={icon}
      rightIcon={rightIcon}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {children ? <span style={mgdButtonText}>{children.trim()}</span> : null}
    </Button>
  );
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

export default MGDButton;

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
