/**
 * This is the components made by Ed, a former designer for the app (web version)
 */

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

import React from 'react';
import {
  mgdLegendEntry,
  mgdLegendEntryDescription,
  mgdLegendEntrySample,
  mgdLineLegendSample,
} from '../../css/MGDLegendEntry';

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

interface OwnProps {
  text: string;
  backgroundColor: string;
  arrow: boolean;
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

function MGDLegendEntry(props: OwnProps) {
  const { text, backgroundColor, arrow } = props;
  return (
    <div style={mgdLegendEntry}>
      <div
        style={{
          ...(arrow ? mgdLineLegendSample : mgdLegendEntrySample),
          backgroundColor,
        }}
      />
      <div style={mgdLegendEntryDescription}>{text}</div>
    </div>
  );
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

export default MGDLegendEntry;

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
