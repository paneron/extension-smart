import { css } from '@emotion/react';
import { CSSROOTVARIABLES } from './root.css';

export const shame__label = css`
  font-weight: ${CSSROOTVARIABLES['--font-weight--regular']};
  font-size: ${CSSROOTVARIABLES['--font-size--small']};
  text-align: center;
  position: absolute;
  top: 45px;
  left: 0;
  width: 140px;
`;

export const tooltip__label = css`
  width: 300px;
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

export const shame__mystery_container = css`
  overflow: hidden;
  display: flex;
  flex-flow: row wrap;
  align-items: center;
`;

export const shame__mystery_container__column = css`
  text-align: center;
  display: flex;
  flex-flow: column nowrap;
`;

export const search_result_entry_row = css`
  display: block;
  text-align: left;
`;

export const search_result_container = css``;
