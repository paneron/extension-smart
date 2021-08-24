/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */

import { css } from '@emotion/react';
import { CSSROOTVARIABLES } from './root.css';

export const mgd_tabs = css`
  font-weight: ${CSSROOTVARIABLES['--font-weight--regular']};
  font-size: ${CSSROOTVARIABLES['--font-size--regular']};
`;

/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */

export const mgd_tabs__item = css`
  border-top: 0.125em solid;
`;

/* unselected */

export const mgd_tabs__item__unselected = css`
  transition-property: background-color, opacity;
  transition-duration: ${CSSROOTVARIABLES['--transition-time']};
  transition-timing-function: ease-in-out;
  border-color: ${CSSROOTVARIABLES['--colour--30-percent-black']};
  :hover {
    background-color: ${CSSROOTVARIABLES['--colour--10-percent-black']};
  };
`;

/* selected */

export const mgd_tabs__item__selected = css`
  background-color: ${CSSROOTVARIABLES['--colour--white']};
  border-color: ${CSSROOTVARIABLES['--colour--bsi-red']};
`;

/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */

export const mgd_tabs__items__faux = css`
  padding: 0.382em;
  display: block;
  white-space: nowrap;
  color: ${CSSROOTVARIABLES['--colour--black']};
  user-select: none;
`;

export const mgd_tabs__items__anchor = css`
  padding: 0.382em;
  display: block;
  white-space: nowrap;
  user-select: none;
  text-decoration-line: none;
  display: block;
`;

// /* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */
