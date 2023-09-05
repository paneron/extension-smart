/**
 * This is the components made by Ed, a former designer for the app (web version)
 */

import React from 'react';
import { mgdLabel } from '@/css/form';

interface OwnProps {
  children: React.ReactNode;
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

function MGDLabel(props: OwnProps) {
  const { children } = props;
  return <label style={mgdLabel}>{children}</label>;
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

export default MGDLabel;
