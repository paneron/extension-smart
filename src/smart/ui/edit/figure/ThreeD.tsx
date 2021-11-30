// import React, { useEffect, useState } from 'react';
// import { Canvas, useThree } from '@react-three/fiber';
// import { GLTF, GLTFLoader, OrbitControls } from 'three-stdlib';

import React from 'react';

// const CameraControl: React.FC = function () {
//   const { camera, gl } = useThree();
//   useEffect(() => {
//     const controls = new OrbitControls(camera, gl.domElement);
//     return () => controls.dispose();
//   }, [camera, gl]);

//   return null;
// };

const ThreeD: React.FC = function () {
  // const [gltf, setGLTF] = useState<GLTF | undefined>(undefined);

  // const path =
  //   'file:///Users/wkwong/GitHub/glTF-Sample-Models/2.0/StainedGlassLamp/glTF/StainedGlassLamp.gltf';

  // useEffect(() => {
  //   const loader = new GLTFLoader();
  //   loader.load(path, setGLTF);
  // });

  return (
    <></>
    // <Canvas>
    //   <CameraControl />
    //   <ambientLight />
    //   {gltf && <primitive object={gltf.scene} />}
    // </Canvas>
  );
};

export default ThreeD;
