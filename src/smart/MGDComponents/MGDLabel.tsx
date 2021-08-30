/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { jsx } from '@emotion/react';
import { mgd_label } from '../../css/form';

interface OwnProps {
  children: React.ReactNode;
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

function MGDLabel(props: OwnProps) {
  const { children } = props;
  return <label css={mgd_label}>{children}</label>;
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

export default MGDLabel;
