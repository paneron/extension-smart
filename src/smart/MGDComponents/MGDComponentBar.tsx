// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
import React from 'react';
import { mgdComponentBar } from '../../css/MGDComponentBar';

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

interface OwnProps {
  children: React.ReactNode;
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

function MGDComponentBar(props: OwnProps) {
  const { children } = props;
  return <footer style={mgdComponentBar}>{children}</footer>;
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

export default MGDComponentBar;

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
