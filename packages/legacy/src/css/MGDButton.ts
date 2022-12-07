/**
 * This is the CSS from Ed, a former designer for the app (web version)
 * They are migrated to TS codes (either CSSProperties or Styled)
 */

import { css, SerializedStyles } from '@emotion/react';
import { CSSProperties } from 'react';
import { CSSROOTVARIABLES } from './root.css';

export const mgdButton: CSSProperties = {
  fontWeight    : CSSROOTVARIABLES.fontWeightRegular,
  border        : 0,
  padding       : 0,
  margin        : 0,
  borderRadius  : '0.2em',
  cursor        : 'pointer',
  transition    : `background-color ${CSSROOTVARIABLES['--transition-time']} ease-in-out`,
  textTransform : 'uppercase',
};

export enum MGDButtonType {
  Primary = 'primary',
  Secondary = 'secondary',
  Tertiary = 'tertiary',
}

export enum MGDButtonSize {
  Small = 'small',
  Regular = 'regular',
  Large = 'large',
}

export const mgd_button_type: Record<MGDButtonType, SerializedStyles> = {
  [MGDButtonType.Primary] : css`
    background-color: ${CSSROOTVARIABLES[
    '--colour--bsi-darker-red'
  ]} !important;
    color: ${CSSROOTVARIABLES['--colour--white']} !important;
    :focus,
    :hover,
    :active {
      background-color: ${CSSROOTVARIABLES[
    '--colour--bsi-dark-red'
  ]} !important;
    }
  `,
  [MGDButtonType.Secondary] : css`
    background-color: ${CSSROOTVARIABLES[
    '--colour--bsi-teal--a11y'
  ]} !important;
    color: ${CSSROOTVARIABLES['--colour--white']} !important;
    :focus,
    :hover,
    :active {
      background-color: ${CSSROOTVARIABLES['--colour--bsi-teal']} !important;
    }
  `,
  [MGDButtonType.Tertiary] : css`
    background-color: ${CSSROOTVARIABLES[
    '--colour--30-percent-black'
  ]} !important;
    color: ${CSSROOTVARIABLES['--colour--black']} !important;
    :focus,
    :hover,
    :active {
      background-color: ${CSSROOTVARIABLES[
    '--colour--50-percent-black'
  ]} !important;
    }
  `,
};

export const mgdButtonSize: Record<MGDButtonSize, CSSProperties> = {
  [MGDButtonSize.Small] : {
    fontSize : CSSROOTVARIABLES['--font-size--small'],
  },
  [MGDButtonSize.Regular] : {
    fontSize : CSSROOTVARIABLES['--font-size--regular'],
  },
  [MGDButtonSize.Large] : {
    fontSize : CSSROOTVARIABLES['--font-size--large'],
  },
};

/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */

export const mgdButtonText: CSSProperties = {
  padding       : '0.618em',
  display       : 'block',
  whiteSpace    : 'nowrap',
  letterSpacing : '0.05em',
};

/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */
