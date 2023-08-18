/**
 * This is the CSS from Ed, a former designer for the app (web version)
 * They are migrated to TS codes (either CSSProperties or Styled)
 */

import type { CSSProperties } from 'react';
import { CSSROOTVARIABLES } from '@/css/root.css';

export const mgdComponentBar: CSSProperties = {
  backgroundColor : CSSROOTVARIABLES['--colour--bsi-light-teal'],
  overflowY       : 'auto',
  textAlign       : 'center',
  padding         : '1em 2em 1em 1em',
};
