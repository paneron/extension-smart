import { css } from '@emotion/react';
import { CSSROOTVARIABLES } from './root.css';

export const view_subprocess_button_layout = css`
  position: fixed;
  right: -10px;
  top: -10px;
`;

export const view_mapping_button_layout = css`
  position: fixed;
  left: -10px;
  top: -10px;
`;

export const mgd_canvas = css`
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  z-index: 100;
  pointer-events: none;
`;

export const mappper_container = css`
  display: flex;
  width: 100%;
  height: 100%;
`;

export const sidebar_layout = css`
  width: 280px;
  z-index: 1;
`;

export const react_flow_container_layout = css`
  flex: 1;
  position: relative;
`;

export const dialog_layout = css`
  width: calc(100vw - 60px);
  padding-bottom: 0;
  & > :last-child {
    overflow-y: auto;
    padding: 20px;
  }
`;

export const dialog_layout__full = css`
  min-height: calc(100vh - 60px);
`;

export const wrapper_container = css`
  position: relative;
`;

export const popover_panel_container = css`
  font-weight: ${CSSROOTVARIABLES['--font-weight--regular']};
  font-size: ${CSSROOTVARIABLES['--font-size--regular']};
  color: ${CSSROOTVARIABLES['--colour--black']};
  background-color: ${CSSROOTVARIABLES['--colour--bsi-pale-teal']};
  padding: 1rem;
  max-width: 30vw;
  max-height: 45vh;
  overflow-y: auto;
`;
