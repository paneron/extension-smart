// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { jsx } from '@emotion/react';
import { ControlButton } from 'react-flow-renderer';
import {
  mgd_control_button,
  mgd_control_button__active,
  mgd_control_button__inactive,
} from '../../css/MGDControlButton';

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

interface OwnProps {
  children: JSX.Element;
  isActive: boolean;
  onClick: (e: any) => void;
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

function MGDControlButton(props: OwnProps) {
  const { children, isActive, onClick } = props;
  const classes = [
    mgd_control_button,
    isActive ? mgd_control_button__active : mgd_control_button__inactive,
  ];
  return (
    <ControlButton css={classes} onClick={onClick}>
      {children}
    </ControlButton>
  );
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

export default MGDControlButton;

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
