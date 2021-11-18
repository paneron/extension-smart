import { Text } from '@blueprintjs/core';
import React, { CSSProperties } from 'react';
import { BINARY_TYPE } from '../../../serialize/interface/supportinterface';

const MultimediaView: React.FC<{
  type: BINARY_TYPE;
  style?: CSSProperties;
  base64: string;
}> = function ({ type, style, base64 }) {
  //   useEffect(() => {
  //     if (type === '3d') {
  //       const view3d = new View3D("#my-canvas");
  //       const loader = new GLTFLoader();
  // loader.load('~/GitHub/glTF-Sample-Models/sourceModels/2.0/WaterBottle/glTF/WaterBottle.gltf').then(model => {
  //   view3d.display(model);
  // }).catch(e => { Logger.logger.log(e); });
  //     }
  // })

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
    <Text> Not supported</Text>
  );
};

export default MultimediaView;
