import { css } from '@emotion/react';
import { CSSROOTVARIABLES } from './root.css';

export const mgd_legend = css`
  font-weight: ${CSSROOTVARIABLES['--font-weight--regular']};
  font-size: ${CSSROOTVARIABLES['--font-size--regular']};
  position: absolute;
  top: 2rem;
  overflow-y: auto;
  z-index: 90;
  background-color: ${CSSROOTVARIABLES['--colour--10-percent-black']};
  padding: 1rem;
`;

export const mgd_legend__right = css`
  right: 0;
`;

export const mgd_legend__left = css`
  left: 0;
`;
