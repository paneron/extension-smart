import React from 'react';
import { useMemo } from 'react';
import ReactFlow, { ReactFlowProvider } from 'react-flow-renderer';
import { MapProfile } from '@/smart/model/mapmodel';
import { MMELRepo, RepoIndex } from '@/smart/model/repo';
import { MapperViewOption } from '@/smart/model/States';
import { repoMapDiffNode } from '@/smart/utils/map/MappingDiff';
import { repoMapExploreNode } from '@/smart/utils/map/RepoMap';
import {
  RepoDiffLegend,
  RepoLegend,
} from '../../../utils/repo/CommonFunctions';
import LegendPane from '@/smart/ui/common/description/LegendPane';
import RepoEdge from '@/smart/ui/flowui/RepoEdge';

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
    <ReactFlowProvider>
      <ReactFlow
        elements={elms}
        onLoad={para => para.fitView()}
        nodesConnectable={false}
        snapToGrid={true}
        snapGrid={[10, 10]}
        nodesDraggable={true}
        edgeTypes={{ repo : RepoEdge }}
      />
      {option && option.repoLegendVisible && (
        <LegendPane
          list={diffMap ? RepoDiffLegend : RepoLegend}
          onLeft
          bottom
        />
      )}
    </ReactFlowProvider>
  );
};

export default RepoMapDiagram;
