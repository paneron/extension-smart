import { css } from '@emotion/react';
import { CSSROOTVARIABLES } from './root.css';

export const mgd_legend_entry = css`
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  align-items: center;
  justify-content: flex-start;
`;

/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */

export const mgd_legend_entry__sample = css`
  width: 0.6em;
  height: 0.6em;
  margin-right: 0.3em;
  border: 1px solid ${CSSROOTVARIABLES['--colour--black']};
`;

/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */

export const mgd_legend_entry__description = css`
  white-space: nowrap;
`;
