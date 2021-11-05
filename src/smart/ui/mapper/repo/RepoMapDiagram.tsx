import React from 'react';
import { useMemo } from 'react';
import ReactFlow from 'react-flow-renderer';
import { MapProfile } from '../../../model/mapmodel';
import { MMELRepo, RepoIndex } from '../../../model/repo';
import { MapperViewOption } from '../../../model/States';
import { repoMapDiffNode } from '../../../utils/map/MappingDiff';
import { repoMapExploreNode } from '../../../utils/map/RepoMap';
import {
  RepoDiffLegend,
  RepoLegend,
} from '../../../utils/repo/CommonFunctions';
import LegendPane from '../../common/description/LegendPane';
import RepoEdge from '../../flowui/RepoEdge';

const RepoMapDiagram: React.FC<{
  index: RepoIndex;
  maps: Record<string, MapProfile>;
  map: MapProfile;
  diffMap?: MapProfile;
  repo: MMELRepo;
  option: MapperViewOption;
  loadModel: (x: string) => void;
}> = function ({ index, maps, map, diffMap, repo, option, loadModel }) {
  const elms = useMemo(
    () =>
      diffMap
        ? repoMapDiffNode(repo, index, map, maps, diffMap, loadModel)
        : repoMapExploreNode(repo, index, map, maps, loadModel),
    [repo, index, map, maps, diffMap]
  );

  return (
    <>
      <ReactFlow
        elements={elms}
        onLoad={para => para.fitView()}
        nodesConnectable={false}
        snapToGrid={true}
        snapGrid={[10, 10]}
        nodesDraggable={true}
        edgeTypes={{ repo: RepoEdge }}
      />
      {option.repoLegendVisible && (
        <LegendPane
          list={diffMap ? RepoDiffLegend : RepoLegend}
          onLeft
          bottom
        />
      )}
    </>
  );
};

export default RepoMapDiagram;
