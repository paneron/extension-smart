/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { jsx } from '@emotion/react';
import { MMELFigure } from '../../../serialize/interface/supportinterface';

const FigureViewer: React.FC<{
  fig: MMELFigure;
}> = function ({ fig }) {
  return (
    <img
      style={{ maxWidth: '90vw' }}
      src={`data:image/jpeg;base64,${fig.data}`}
    />
  );
};

export default FigureViewer;
