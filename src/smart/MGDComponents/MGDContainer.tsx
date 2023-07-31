/**
 * This is the components made by Ed, a former designer for the app (web version)
 */

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

import React from 'react';
import { mgdContainer } from '@/css/MGDContainer';

interface OwnProps {
  children: React.ReactNode;
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

function MGDContainer(props: OwnProps) {
  const { children } = props;
  return <div style={mgdContainer}>{children}</div>;
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

export default MGDContainer;

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
