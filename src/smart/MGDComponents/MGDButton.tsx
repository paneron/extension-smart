// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { Button, IconName } from '@blueprintjs/core';
import { jsx } from '@emotion/react';
import {
  MGDButtonSize,
  MGDButtonType,
  mgd_button,
  mgd_button_size,
  mgd_button_type,
  mgd_button__text,
} from '../../css/MGDButton';

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

interface OwnProps {
  type?: MGDButtonType;
  size?: MGDButtonSize;
  children?: string;
  icon?: IconName;
  rightIcon?: IconName;
  id?: string;
  onClick?: (e: any) => void;
  disabled?: boolean;
  onMouseEnter?: (e: any) => void;
  onMouseLeave?: (e: any) => void;
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
    className
  } = props;
  const buttonClasses = [
    mgd_button,
    mgd_button_type[type],
    mgd_button_size[size],
  ];
  const textClasses = [mgd_button__text];
  return (
    <Button    
      outlined
      small={size === MGDButtonSize.Small}
      id={id}
      css={buttonClasses}
      onClick={onClick}
      disabled={disabled}
      className={className}
      icon={icon}
      rightIcon={rightIcon}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {children ? <span css={textClasses}>{children.trim()}</span> : null}
    </Button>
  );
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

export default MGDButton;

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
