/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { jsx } from '@emotion/react';
import { mgdLabel } from '../../css/form';

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
