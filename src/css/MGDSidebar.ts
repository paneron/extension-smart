/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */

import { css } from "@emotion/react";
import { CSSROOTVARIABLES } from "./root.css";

export const mgd_sidebar = css`  
  font-weight: ${CSSROOTVARIABLES['--font-weight--regular']};
  font-size: ${CSSROOTVARIABLES['--font-size--regular']};
  background-color: ${CSSROOTVARIABLES['--colour--bsi-pale-teal']};
  padding: 1rem;
  max-height: 70vh;
  overflow-y: auto;  
`;

/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */
