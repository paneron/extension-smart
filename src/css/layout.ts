/**
 * This is the CSS from Ed, a former designer for the app (web version)
 * They are migrated to TS codes (either CSSProperties or Styled)
 */

import { css } from '@emotion/react';
import { CSSProperties } from 'react';
import { CSSROOTVARIABLES } from './root.css';

export const flownode_top_left_button_layout = css`
  position: fixed;
  right: -10px;
  top: -10px;
`;

export const flownodeTopLeftButtonLayout: CSSProperties = {
  position: 'fixed',
  right: -10,
  top: -10,
};

export const flownodeTopRightButtonLayout: CSSProperties = {
  position: 'fixed',
  left: -10,
  top: -10,
};

export const mgdCanvas: CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  bottom: 0,
  right: 0,
  zIndex: 100,
  pointerEvents: 'none',
};

export const multi_model_container = css`
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

export const reactFlowContainerLayout: CSSProperties = {
  flex: 1,
  position: 'relative',
};

export const dialog_layout = css`
  width: calc(100vw - 60px);
  padding-bottom: 0;
  & > :last-child {
    overflow-y: auto;
    padding: 20px;
  }
`;

export const dialogLayout: CSSProperties = {
  width: 'calc(100vw - 60px)',
  paddingBottom: 0,
  overflowY: 'auto',
};

export const application_dialog_layout = css`
  width: 70vw;
`;

export const applicationDialogLayout: CSSProperties = {
  width: '70vw',
};

export const dialog_layout__full = css`
  min-height: calc(100vh - 60px);
`;

export const dialogLayoutFull: CSSProperties = {
  minHeight: 'calc(100vh - 60px)',
};

export const wrapper_container = css`
  position: relative;
`;

export const wrapperContainer: CSSProperties = {
  position: 'relative',
};

export const popoverPanelContainer: CSSProperties = {
  fontWeight: CSSROOTVARIABLES.fontWeightRegular,
  fontSize: CSSROOTVARIABLES['--font-size--regular'],
  color: CSSROOTVARIABLES['--colour--black'],
  backgroundColor: CSSROOTVARIABLES['--colour--bsi-pale-teal'],
  padding: '1rem',
  maxWidth: '30vw',
  maxHeight: '45vh',
  overflowY: 'auto',
};
