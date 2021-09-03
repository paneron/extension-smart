/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { jsx } from '@emotion/react';
import { mgd_heading } from '../../css/form';

interface OwnProps {
  children: React.ReactNode;
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

function MGDHeading(props: OwnProps) {
  const { children } = props;
  return <label css={mgd_heading}>{children}</label>;
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

export default MGDHeading;
