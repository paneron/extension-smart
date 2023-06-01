/**
 * This is the CSS from Ed, a former designer for the app (web version)
 * They are migrated to TS codes (either CSSProperties or Styled)
 */

import { css } from '@emotion/react';
import { CSSROOTVARIABLES } from '@/css/root.css';

export const vertical_line = css`
  border-left: 2px solid ${CSSROOTVARIABLES['--colour--black']};
  height: 100%;
  top: 0;
`;
