// import { Button, Text } from '@blueprintjs/core';
// import { DatasetContext } from '@riboseinc/paneron-extension-kit/context';
// import React, { useContext, useMemo } from 'react';
import React from 'react';
import MGDDisplayPane from '../../../MGDComponents/MGDDisplayPane';
import { MapProfile } from '../../../model/mapmodel';
import { MMELRepo, RepoIndex } from '../../../model/repo';
// import { getAllRepoMaps } from '../../../utils/repo/CommonFunctions';
// import { LoadingPage } from '../../common/Loading';

const RepoAutoMapper: React.FC<{
  repo: MMELRepo;
  index: RepoIndex;
  setMapProfile: (x: MapProfile) => void;
}> = function ({ repo, index }) {
  // const { useObjectData } = useContext(DatasetContext);

  // const mapFiles = useObjectData({
  //   objectPaths: getAllRepoMaps(index),
  // });

  // const maps: Record<string, MapProfile> = useMemo(() => {
  //   if (!mapFiles.isUpdating) {
  //     return Object.entries(mapFiles.value.data).reduce<
  //       Record<string, MapProfile>
  //     >(
  //       (obj, [ns, x]) =>
  //         x !== null ? { ...obj, [ns]: x as MapProfile } : obj,
  //       {}
  //     );
  //   }
  //   return {};
  // }, [mapFiles.isUpdating]);

  return (
    <MGDDisplayPane>
      <p> Steps to use the auto mapper </p>
      <ol>
        <li>Load repo information</li>
        <li>Select relevant model as a bridge to discover new mappings</li>
        <li>Calculate transitive mapping</li>
        <li>Select target models to add to mappings of the current model</li>
      </ol>
      <div></div>
    </MGDDisplayPane>
  );
};

// const InitialPage:React.FC<{}> = function({}) {
//   const isUpdating = false;

//   return (
//     <div style={{width:400, height:400}}>
//       I am here!!!
//     {isUpdating ? <LoadingPage label='Loading repo information'/> : (
//       <div>
//       <Text> Loading completed.</Text>
//       <Button> Next </Button>
//       </div>
//     )}
//     </div>
//   );
// }

export default RepoAutoMapper;
