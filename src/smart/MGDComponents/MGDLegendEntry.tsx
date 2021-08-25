// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { jsx } from '@emotion/react';
import {
  mgd_legend_entry,
  mgd_legend_entry__description,
  mgd_legend_entry__sample,
} from '../../css/MGDLegendEntry';

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

interface OwnProps {
  text: string;
  backgroundColor: string;
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

function MGDLegendEntry(props: OwnProps) {
  const { text, backgroundColor } = props;
  return (
    <div css={mgd_legend_entry}>
      <div css={mgd_legend_entry__sample} style={{ backgroundColor }} />
      <div css={mgd_legend_entry__description}>{text}</div>
    </div>
  );
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

export default MGDLegendEntry;

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
