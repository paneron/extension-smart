/**
 * This is the CSS from Ed, a former designer for the app (web version)
 * They are migrated to TS codes (either CSSProperties or Styled)
 */

import { css } from '@emotion/react';
import { CSSProperties } from 'react';
import { CSSROOTVARIABLES } from '@/css/root.css';

export const mgd_display_pane = css`
  background-color: ${CSSROOTVARIABLES['--colour--bsi-pale-red']};
  overflow-y: auto;
  padding: 1em 2em 1em 1em;
`;

export const mgdDisplayPane: CSSProperties = {
  backgroundColor : CSSROOTVARIABLES['--colour--bsi-pale-red'],
  overflowY       : 'auto',
  padding         : '1em 2em 1em 1em',
};

export const application2060DisplayPane: CSSProperties = {
  backgroundColor : '#fcd49f',
  overflowY       : 'auto',
  padding         : '1em 2em 1em 1em',
};
