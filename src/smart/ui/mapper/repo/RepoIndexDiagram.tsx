import React from 'react';
import { useMemo } from 'react';
import ReactFlow from 'react-flow-renderer';
import { ModelWrapper } from '@/smart/model/modelwrapper';
import { MMELRepo, RepoIndex } from '@/smart/model/repo';
import { RepoLegend } from '@/smart/utils/repo/CommonFunctions';
import { repoLinkExploreNode } from '@/smart/utils/repo/LinkAnalysis';
import LegendPane from '@/smart/ui/common/description/LegendPane';
import RepoEdge from '@/smart/ui/flowui/RepoEdge';

const RepoIndexDiagram: React.FC<{
  index: RepoIndex;
  models?: Record<string, ModelWrapper>;
  repo: MMELRepo;
}> = function ({ index, models, repo }) {
  const elms = useMemo(
    () => repoLinkExploreNode(index, repo, models),
    [repo, index, models]
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
        edgeTypes={{ repo : RepoEdge }}
      />
      <LegendPane list={RepoLegend} onLeft={false} />
    </>
  );
};

export default RepoIndexDiagram;
