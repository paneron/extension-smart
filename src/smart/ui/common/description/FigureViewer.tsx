import React from 'react';
import { MMELFigure } from '../../../serialize/interface/supportinterface';
import { DescriptionItem } from './fields';

const FigureViewer: React.FC<{
  fig: MMELFigure;
}> = function ({ fig }) {
  return (
    <>
      <DescriptionItem label="Title" value={fig.title} />
      <img
        style={{ maxWidth: '90vw' }}
        src={`data:image/jpeg;base64,${fig.data}`}
      />
    </>
  );
};

export default FigureViewer;
