import { css } from '@emotion/react';
import { CSSROOTVARIABLES } from './root.css';

export const shame__label = css`
  font-weight: ${CSSROOTVARIABLES['--font-weight--regular']};
  font-size: ${CSSROOTVARIABLES['--font-size--regular']};
  text-align: center;
  position: absolute;
  top: 45px;
  left: 0;
  width: 140px;
`;

export const shame__label__short = css`
  width: 40px;
`;

export const shame__label__long = css`
  left: -50px;
`;

export const shame__label__nudge = css`
  top: 65px;
`;

export const shame__approver_deco = css`
  color: green;
`;
