import { css } from '@emotion/react';
import { CSSROOTVARIABLES } from './root.css';

export const vertical_line = css`
  border-left: 2px solid ${CSSROOTVARIABLES['--colour--black']};
  height: 100%;
  top: 0;
`;
