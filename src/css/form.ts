/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */

import { css } from '@emotion/react';
import { CSSProperties } from 'react';
import { CSSROOTVARIABLES } from './root.css';

const normal_font_style = css`
  font-weight: ${CSSROOTVARIABLES['--font-weight--regular']};
  font-size: ${CSSROOTVARIABLES['--font-size--regular']};
`;

const normalFontStyle: CSSProperties = {
  fontWeight: CSSROOTVARIABLES.fontWeightRegular,
  fontSize: CSSROOTVARIABLES['--font-size--regular'],
};

const heading_font_style = css`
  font-weight: ${CSSROOTVARIABLES['--font-weight--regular']};
  font-size: ${CSSROOTVARIABLES['--font-size--large']};
`;

const headingFontStyle: CSSProperties = {
  fontWeight: CSSROOTVARIABLES.fontWeightRegular,
  fontSize: CSSROOTVARIABLES['--font-size--large'],
};

const background_style = css`
  background-color: ${CSSROOTVARIABLES['--colour--white']};
  border: 1px solid ${CSSROOTVARIABLES['--colour--50-percent-black']};
  padding: 0.146em;
`;

const backgroundStyle: CSSProperties = {
  backgroundColor: CSSROOTVARIABLES['--colour--white'],
  border: `1px solid ${CSSROOTVARIABLES['--colour--50-percent-black']}`,
  padding: '0.146em',
};

export const mgd_input = css`
  ${normal_font_style};
  ${background_style};
`;

export const mgdTextarea: CSSProperties = {
  ...normalFontStyle,
  ...backgroundStyle,
  resize: 'both',
  verticalAlign: 'middle',
};

export const mgd_label = css`
  ${normal_font_style};
`;

export const mgdLabel: CSSProperties = {
  ...normalFontStyle,
};

export const mgd_heading = css`
  ${heading_font_style};
`;

export const mgdHeading: CSSProperties = {
  ...headingFontStyle,
};

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
