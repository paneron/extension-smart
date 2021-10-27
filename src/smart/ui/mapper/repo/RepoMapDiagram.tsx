/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { jsx } from '@emotion/react';
import React from 'react';
import { useMemo } from 'react';
import ReactFlow from 'react-flow-renderer';
import { MapProfile } from '../../../model/mapmodel';
import { ModelWrapper } from '../../../model/modelwrapper';
import { MMELRepo, RepoIndex } from '../../../model/repo';
import { MapperViewOption } from '../../../model/States';
import { repoMapExploreNode } from '../../../utils/map/RepoMap';
import { RepoMapLegend } from '../../../utils/repo/CommonFunctions';
import LegendPane from '../../common/description/LegendPane';
import RepoEdge from '../../flowui/RepoEdge';

const RepoMapDiagram: React.FC<{
  index: RepoIndex;
  maps: Record<string, MapProfile>;
  models: Record<string, ModelWrapper> | undefined;
  repo: MMELRepo;
  option: MapperViewOption;
  loadModel: (x: string) => void;
}> = function ({ index, maps, models, repo, option, loadModel }) {
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
        <LegendPane list={RepoMapLegend} onLeft bottom />
      )}
    </>
  );
};

export default RepoMapDiagram;
