/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */

import { css } from '@emotion/react';
import { CSSROOTVARIABLES } from './root.css';

const font_style = css`
  font-weight: ${CSSROOTVARIABLES['--font-weight--regular']};
  font-size: ${CSSROOTVARIABLES['--font-size--regular']};
`;

const background_style = css`
  background-color: ${CSSROOTVARIABLES['--colour--white']};
  border: 1px solid ${CSSROOTVARIABLES['--colour--50-percent-black']};
  padding: 0.146em;
`;

export const mgd_input = css`
  ${font_style};
  ${background_style};
`;
export const mgd_textarea = css`
  ${font_style};
  ${background_style};
  resize: both;
  vertical-align: middle;
`;
export const mgd_label = css`
  ${font_style};
`;
export const mgd_select = css`
  ${font_style};
  ${background_style};
`;

export const mgd_select__constrained = css`
  min-width: 100px;
  min-height: 200px;
`;

export const mgd_select__restrained = css`
  width: 100%;
  min-height: 50%;
`;
