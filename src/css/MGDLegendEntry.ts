/**
 * This is the CSS from Ed, a former designer for the app (web version)
 * They are migrated to TS codes (either CSSProperties or Styled)
 */

import type { CSSProperties } from 'react';
import { CSSROOTVARIABLES } from '@/css/root.css';

export const mgdLegendEntry: CSSProperties = {
  display        : 'flex',
  flexDirection  : 'row',
  flexWrap       : 'nowrap',
  alignItems     : 'center',
  justifyContent : 'flex-start',
};

/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */

export const mgdLegendEntrySample: CSSProperties = {
  width       : '0.6em',
  height      : '0.6em',
  marginRight : '0.3em',
  border      : `1px solid ${CSSROOTVARIABLES['--colour--black']}`,
};

export const mgdLineLegendSample: CSSProperties = {
  width       : '1em',
  height      : '0.2em',
  marginRight : '0.3em',
};

/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */

export const mgdLegendEntryDescription: CSSProperties = {
  whiteSpace : 'nowrap',
};
