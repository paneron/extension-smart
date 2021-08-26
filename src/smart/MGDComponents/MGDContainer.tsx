// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { jsx } from '@emotion/react';
import { mgd_container } from '../../css/MGDContainer';

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

interface OwnProps {
  children: any;
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

function MGDContainer(props: OwnProps) {
  const { children } = props;
  return <div css={mgd_container}>{children}</div>;
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

export default MGDContainer;

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
