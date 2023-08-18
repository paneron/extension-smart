import { Text } from '@blueprintjs/core';
import type { CSSProperties } from 'react';
import React from 'react';
import type { BINARY_TYPE } from '@paneron/libmmel/interface/supportinterface';
// import ThreeD from '@/smart/ui/edit/figure/ThreeD';

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
    <Text> Not supported</Text>
  ) : (
    // <ThreeD />
    <Text> Not supported</Text>
  );
};

export default MultimediaView;
