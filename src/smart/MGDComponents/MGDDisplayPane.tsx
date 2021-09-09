// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { jsx } from '@emotion/react';
import {
  application2060_display_pane,
  mgd_display_pane,
} from '../../css/MGDDisplayPane';

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

interface OwnProps {
  children: any;
  isBSI?: boolean;
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

function MGDDisplayPane(props: OwnProps) {
  const { children, isBSI = true } = props;
  return (
    <div css={isBSI ? mgd_display_pane : application2060_display_pane}>
      {children}
    </div>
  );
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

export default MGDDisplayPane;

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
