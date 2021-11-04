import { CSSProperties } from 'react';
import { CSSROOTVARIABLES } from './root.css';

export const mgdControlButton: CSSProperties = {
  fontWeight: CSSROOTVARIABLES.fontWeightRegular,
  fontSize: CSSROOTVARIABLES['--font-size--regular'],
};

export const mgdControlButtonActive: CSSProperties = {
  backgroundColor: `${CSSROOTVARIABLES['--colour--bsi-teal']} !important`,
  color: CSSROOTVARIABLES['--colour--white'],
};

export const mgdControlButtonInactive: CSSProperties = {
  backgroundColor: `${CSSROOTVARIABLES['--colour--10-percent-black']} !important`,
};
