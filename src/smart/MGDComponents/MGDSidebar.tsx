/**
 * This is the components made by Ed, a former designer for the app (web version)
 */

import React from 'react';
import { mgdSidebar } from '../../css/MGDSidebar';

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

interface OwnProps {
  children: React.ReactNode;
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

function MGDSidebar(props: OwnProps) {
  const { children } = props;
  return <aside style={mgdSidebar}>{children}</aside>;
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

export default MGDSidebar;

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
