/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */

import { css, SerializedStyles } from '@emotion/react';
import { CSSROOTVARIABLES } from './root.css';

export const mgd_button = css`
  font-weight: ${CSSROOTVARIABLES['--font-weight--regular']};
  border: 0;
  padding: 0;
  margin: 0;
  border-radius: 0.2em;
  cursor: pointer;
  transition: background-color ${CSSROOTVARIABLES['--transition-time']}
    ease-in-out;
  text-transform: uppercase;
`;

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
  [MGDButtonType.Primary]: css`
    background-color: ${CSSROOTVARIABLES['--colour--bsi-darker-red']} !important;
    color: ${CSSROOTVARIABLES['--colour--white']} !important;
    :focus, :hover, :active {
      background-color: ${CSSROOTVARIABLES['--colour--bsi-dark-red']} !important;
    };    
  `,
  [MGDButtonType.Secondary]: css`
    background-color: ${CSSROOTVARIABLES['--colour--bsi-teal--a11y']} !important;
    color: ${CSSROOTVARIABLES['--colour--white']} !important;
    :focus, :hover, :active {
      background-color: ${CSSROOTVARIABLES['--colour--bsi-teal']} !important;
    }
  `,
  [MGDButtonType.Tertiary]: css`
    background-color: ${CSSROOTVARIABLES['--colour--30-percent-black']} !important;
    color: ${CSSROOTVARIABLES['--colour--black']} !important;
    :focus, :hover, :active {
      background-color: ${CSSROOTVARIABLES['--colour--50-percent-black']} !important;
    }
  `,
};

export const mgd_button_size: Record<MGDButtonSize, SerializedStyles> = {
  [MGDButtonSize.Small]: css`
    font-size: ${CSSROOTVARIABLES['--font-size--small']};
  `,
  [MGDButtonSize.Regular]: css`
    font-size: ${CSSROOTVARIABLES['--font-size--regular']};
  `,
  [MGDButtonSize.Large]: css`
    font-size: ${CSSROOTVARIABLES['--font-size--large']};
  `,
};

/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */

export const mgd_button__text = css`
  padding: 0.618em;
  display: block;
  white-space: nowrap;
  letter-spacing: 0.05em;
`;

/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */
