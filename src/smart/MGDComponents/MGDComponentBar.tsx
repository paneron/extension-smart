// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { jsx } from '@emotion/react';
import { mgd_component_bar } from '../../css/MGDComponentBar';

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

interface OwnProps {
    children: any;    
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

function MGDComponentBar(props: OwnProps) {
    const { children } = props;    
    return <footer css={mgd_component_bar}>{children}</footer>;
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

export default MGDComponentBar;

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
