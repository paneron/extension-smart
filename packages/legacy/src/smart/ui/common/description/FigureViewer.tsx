import React from 'react';
import { MMELFigure } from '../../../serialize/interface/supportinterface';
import { DescriptionItem } from './fields';
import MultimediaView from './Multimedia';

const FigureViewer: React.FC<{
  fig: MMELFigure;
}> = function ({ fig }) {
  return (
    <>
      <DescriptionItem label="Title" value={fig.title} />
      <MultimediaView
        type={fig.type}
        base64={fig.data}
        style={{ maxWidth : '90vw' }}
      />
    </>
  );
};

export default FigureViewer;
