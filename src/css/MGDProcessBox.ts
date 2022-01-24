/**
 * This is the CSS from Ed, a former designer for the app (web version)
 * They are migrated to TS codes (either CSSProperties or Styled)
 */

/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { css } from '@emotion/react';
import { CSSROOTVARIABLES } from './root.css';

export const mgd_process_box = css`
  font-weight: ${CSSROOTVARIABLES['--font-weight--regular']};
  font-size: ${CSSROOTVARIABLES['--font-size--small']};
  background-color: ${CSSROOTVARIABLES['--plain-node-color']};
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  border-radius: 0.25em;
  border: 1px solid;
  width: 140px;
  height: 45px;
  padding: 1em;
`;
