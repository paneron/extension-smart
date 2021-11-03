import React from 'react';
import { useMemo } from 'react';
import ReactFlow from 'react-flow-renderer';
import { MapProfile } from '../../../model/mapmodel';
import { MMELRepo, RepoIndex } from '../../../model/repo';
import { MapperViewOption } from '../../../model/States';
import { repoMapExploreNode } from '../../../utils/map/RepoMap';
import { RepoLegend } from '../../../utils/repo/CommonFunctions';
import LegendPane from '../../common/description/LegendPane';
import RepoEdge from '../../flowui/RepoEdge';

const RepoMapDiagram: React.FC<{
  index: RepoIndex;
  maps: Record<string, MapProfile>;
  repo: MMELRepo;
  option: MapperViewOption;
  loadModel: (x: string) => void;
}> = function ({ index, maps, repo, option, loadModel }) {
  const elms = useMemo(
    () => repoMapExploreNode(repo, index, maps, loadModel),
    [repo, index, maps]
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
        <LegendPane list={RepoLegend} onLeft bottom />
      )}
    </>
  );
};

export default RepoMapDiagram;
