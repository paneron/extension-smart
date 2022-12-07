/**
 * This is the components made by Ed, a former designer for the app (web version)
 */

import React from 'react';
import {
  mgdLegend,
  mgdLegendBottom,
  mgdLegendLeft,
  mgdLegendNormal,
  mgdLegendRight,
} from '../../css/MGDLegend';

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

interface OwnProps {
  children: JSX.Element[];
  onLeft: boolean;
  bottom: boolean;
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

function MGDLegend(props: OwnProps) {
  const { children, onLeft, bottom } = props;
  return (
    <aside
      style={{
        ...mgdLegend,
        ...(onLeft ? mgdLegendLeft : mgdLegendRight),
        ...(bottom ? mgdLegendBottom : mgdLegendNormal),
      }}
    >
      {children}
    </aside>
  );
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

export default MGDLegend;

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
