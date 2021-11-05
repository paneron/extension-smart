import React from 'react';
import { mgdHeading } from '../../css/form';

interface OwnProps {
  children: React.ReactNode;
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

function MGDHeading(props: OwnProps) {
  const { children } = props;
  return <label style={mgdHeading}>{children}</label>;
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

export default MGDHeading;
