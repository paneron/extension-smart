/**
 * This is the CSS from Ed, a former designer for the app (web version)
 * They are migrated to TS codes (either CSSProperties or Styled)
 */

import { CSSProperties } from 'react';
import { CSSROOTVARIABLES } from './root.css';

export const mgdSidebar: CSSProperties = {
  fontWeight      : CSSROOTVARIABLES.fontWeightRegular,
  fontSize        : CSSROOTVARIABLES['--font-size--regular'],
  backgroundColor : CSSROOTVARIABLES['--colour--bsi-pale-teal'],
  padding         : '1rem',
  maxHeight       : '70vh',
  overflowY       : 'auto',
};

/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */
