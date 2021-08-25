// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { jsx } from '@emotion/react';
import {
  mgd_legend,
  mgd_legend__left,
  mgd_legend__right,
} from '../../css/MGDLegend';

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

interface OwnProps {
  children: JSX.Element[];
  onLeft: boolean;
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

function MGDLegend(props: OwnProps) {
  const { children, onLeft } = props;
  return (
    <aside css={[mgd_legend, onLeft ? mgd_legend__left : mgd_legend__right]}>
      {children}
    </aside>
  );
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

export default MGDLegend;

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
