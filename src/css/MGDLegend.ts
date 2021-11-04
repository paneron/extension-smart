import { CSSProperties } from 'react';
import { CSSROOTVARIABLES } from './root.css';

export const mgdLegend: CSSProperties = {
  fontWeight: CSSROOTVARIABLES.fontWeightRegular,
  fontSize: CSSROOTVARIABLES['--font-size--regular'],
  position: 'absolute',
  overflowY: 'auto',
  zIndex: 90,
  backgroundColor: CSSROOTVARIABLES['--colour--10-percent-black'],
  padding: '1rem',
};

export const mgdLegendRight: CSSProperties = {
  right: 0,
};

export const mgdLegendLeft: CSSProperties = {
  left: 0,
};

export const mgdLegendNormal: CSSProperties = {
  top: '2rem',
};

export const mgdLegendBottom: CSSProperties = {
  bottom: 0,
};
