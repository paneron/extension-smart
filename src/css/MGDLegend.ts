/**
 * This is the CSS from Ed, a former designer for the app (web version)
 * They are migrated to TS codes (either CSSProperties or Styled)
 */

import { CSSProperties } from 'react';
import { CSSROOTVARIABLES } from '@/css/root.css';

export const mgdLegend: CSSProperties = {
  fontWeight      : CSSROOTVARIABLES.fontWeightRegular,
  fontSize        : CSSROOTVARIABLES['--font-size--regular'],
  position        : 'absolute',
  overflowY       : 'auto',
  zIndex          : 90,
  backgroundColor : CSSROOTVARIABLES['--colour--10-percent-black'],
  padding         : '1rem',
};

export const mgdLegendRight: CSSProperties = {
  right : 2,
};

export const mgdLegendLeft: CSSProperties = {
  left : 2,
};

export const mgdLegendNormal: CSSProperties = {
  top : 20,
};

export const mgdLegendBottom: CSSProperties = {
  bottom : 0,
};
