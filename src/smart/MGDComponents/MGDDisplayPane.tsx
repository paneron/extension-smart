// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
import React from 'react';
import {
  application2060DisplayPane,
  mgdDisplayPane,
} from '../../css/MGDDisplayPane';

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

interface OwnProps {
  children: React.ReactNode;
  isBSI?: boolean;
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

function MGDDisplayPane(props: OwnProps) {
  const { children, isBSI = true } = props;
  return (
    <div style={isBSI ? mgdDisplayPane : application2060DisplayPane}>
      {children}
    </div>
  );
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

export default MGDDisplayPane;

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
