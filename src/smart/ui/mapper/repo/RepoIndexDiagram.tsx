/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { jsx } from '@emotion/react';
import React from 'react';
import { useMemo } from 'react';
import ReactFlow from 'react-flow-renderer';
import { ModelWrapper } from '../../../model/modelwrapper';
import { MMELRepo, RepoIndex } from '../../../model/repo';
import { RepoLegend } from '../../../utils/repo/CommonFunctions';
import { repoLinkExploreNode } from '../../../utils/repo/LinkAnalysis';
import LegendPane from '../../common/description/LegendPane';
import RepoEdge from '../../flowui/RepoEdge';

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
        edgeTypes={{ repo: RepoEdge }}
      />
      <LegendPane list={RepoLegend} onLeft={false} />
    </>
  );
};

export default RepoIndexDiagram;
