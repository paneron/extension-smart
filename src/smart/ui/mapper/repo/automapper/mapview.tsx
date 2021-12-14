import React from 'react';
import ReactFlow, { Elements, ReactFlowProvider } from 'react-flow-renderer';
import { RepoLegend } from '../../../../utils/repo/CommonFunctions';
import LegendPane from '../../../common/description/LegendPane';
import RepoEdge from '../../../flowui/RepoEdge';

const RepoAutoMapView: React.FC<{
  fnodes: Elements;
}> = function ({ fnodes }) {
  return (
    <ReactFlowProvider>
      <ReactFlow
        elements={fnodes}
        onLoad={p => p.fitView()}
        nodesConnectable={false}
        snapToGrid={true}
        snapGrid={[10, 10]}
        nodesDraggable={true}
        edgeTypes={{ repo: RepoEdge }}
      />
      <LegendPane list={RepoLegend} onLeft bottom />
    </ReactFlowProvider>
  );
};

export default RepoAutoMapView;
