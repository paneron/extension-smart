/**
 * This is the CSS from Ed, a former designer for the app (web version)
 * They are migrated to TS codes (either CSSProperties or Styled)
 */

/**
 * Ed made this file. It contains the items that their designs are not done yet
 */

import { css } from '@emotion/react';
import { CSSProperties } from 'react';
import { CSSROOTVARIABLES } from '@/css/root.css';

export const shameLabel: CSSProperties = {
  fontWeight : CSSROOTVARIABLES.fontWeightRegular,
  fontSize   : CSSROOTVARIABLES['--font-size--small'],
  textAlign  : 'center',
  position   : 'absolute',
  top        : 45,
  left       : 0,
  width      : 140,
};

export const shameLabelNoAction: CSSProperties = {
  pointerEvents : 'none',
};

export const tooltip__label = css`
  width: 300px;
`;

export const tooltipLabel: CSSProperties = {
  width : 300,
};

export const shameLabelShort: CSSProperties = {
  width : 40,
};

export const shameLabelLong: CSSProperties = {
  left : -50,
};

export const shameLabelNudge: CSSProperties = {
  top : 65,
};

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

export const searchResultEntryRow: CSSProperties = {
  display   : 'block',
  textAlign : 'left',
};
