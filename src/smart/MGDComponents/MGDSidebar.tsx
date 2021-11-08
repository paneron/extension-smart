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
