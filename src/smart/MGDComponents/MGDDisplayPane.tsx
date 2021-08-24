// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { jsx } from '@emotion/react';
import { mgd_display_pane } from '../../css/MGDDisplayPane'

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

interface OwnProps {
  children: any;  
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

function MGDDisplayPane(props: OwnProps) {
    const { children } = props;    
    return (
        <div css={mgd_display_pane}>
            {children}
        </div>
    );
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

export default MGDDisplayPane;

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
