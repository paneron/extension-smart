/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { jsx } from '@emotion/react';
import { createRef, useState } from 'react';

const ref = createRef<HTMLCanvasElement>();
const imageref = createRef<HTMLImageElement>();

const MyMapBackground: React.FC<{
  x: number;
  y: number;
  size: number;
}> = function ({ x, y, size }) {
  const imgx = x * 7 + 10;
  const imgy = y * 7 + 10;
  const imgsize = size * 7;

  const [ready, setReady] = useState<boolean>(false);

  if (ready) {
    const canvas = ref.current;
    const image = imageref.current;
    if (canvas !== null && image !== null) {
      const ctx = canvas.getContext('2d');
      if (ctx !== null) {
        ctx.drawImage(
          image,
          imgx,
          imgy,
          imgsize,
          imgsize,
          0,
          0,
          canvas.width,
          canvas.height
        );
      }
    }
  }

  return (
    <canvas
      ref={ref}
      style={{
        position: 'absolute',
        width: '200px',
        height: '200px',
        zIndex: 15,
        padding: 0,
      }}
    >
      <img
        ref={imageref}
        src="http://localhost:3000/map.png"
        onLoad={() => setReady(true)}
      />
    </canvas>
  );
};

export default MyMapBackground;
