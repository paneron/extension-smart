import React from 'react';
import { MMELFigure } from '@paneron/libmmel/interface/supportinterface';
import { DescriptionItem } from '@/smart/ui/common/description/fields';
import MultimediaView from '@/smart/ui/common/description/Multimedia';

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
