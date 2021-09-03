/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */

import { css } from '@emotion/react';
import { CSSROOTVARIABLES } from './root.css';

const normal_font_style = css`
  font-weight: ${CSSROOTVARIABLES['--font-weight--regular']};
  font-size: ${CSSROOTVARIABLES['--font-size--regular']};
`;

const heading_font_style = css`
  font-weight: ${CSSROOTVARIABLES['--font-weight--regular']};
  font-size: ${CSSROOTVARIABLES['--font-size--large']};
`;

const background_style = css`
  background-color: ${CSSROOTVARIABLES['--colour--white']};
  border: 1px solid ${CSSROOTVARIABLES['--colour--50-percent-black']};
  padding: 0.146em;
`;

export const mgd_input = css`
  ${normal_font_style};
  ${background_style};
`;

export const mgd_textarea = css`
  ${normal_font_style};
  ${background_style};
  resize: both;
  vertical-align: middle;
`;

export const mgd_label = css`
  ${normal_font_style};
`;

export const mgd_heading = css`
  ${heading_font_style};
`;

export const mgd_select = css`
  ${normal_font_style};
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
