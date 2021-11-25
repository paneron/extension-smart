import { Text } from '@blueprintjs/core';
import React, { CSSProperties } from 'react';
import { BINARY_TYPE } from '../../../serialize/interface/supportinterface';
import ThreeD from '../../edit/figure/ThreeD';

const MultimediaView: React.FC<{
  type: BINARY_TYPE;
  style?: CSSProperties;
  base64: string;
}> = function ({ type, style, base64 }) {
  return type === 'fig' ? (
    <img style={style} src={`data:image/jpeg;base64,${base64}`} />
  ) : type === 'video' ? (
    <video
      style={style}
      src="https://www.w3schools.com/html/movie.mp4"
      controls
    />
  ) : type === '3d' ? (    
    <ThreeD />
  ) : (
    <Text> Not supported</Text>
  );
};

export default MultimediaView;
