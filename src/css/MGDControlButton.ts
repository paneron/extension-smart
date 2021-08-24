import { css } from "@emotion/react";
import { CSSROOTVARIABLES } from "./root.css";

export const mgd_control_button = css`  
  font-weight: ${CSSROOTVARIABLES['--font-weight--regular']};
  font-size: ${CSSROOTVARIABLES['--font-weight--regular']} var(--font-size--regular);
`;

export const mgd_control_button__active = css`
  background-color: ${CSSROOTVARIABLES['--colour--bsi-teal']} !important;
  color: ${CSSROOTVARIABLES['--colour--white']};
`;

export const mgd_control_button__inactive = css`
  background-color: ${CSSROOTVARIABLES['--colour--10-percent-black']} !important;
`;
