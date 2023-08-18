import React from 'react';
import type { Elements } from 'react-flow-renderer';
import ReactFlow, { ReactFlowProvider } from 'react-flow-renderer';
import { RepoLegend } from '@/smart/utils/repo/CommonFunctions';
import LegendPane from '@/smart/ui/common/description/LegendPane';
import RepoEdge from '@/smart/ui/flowui/RepoEdge';

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
        edgeTypes={{ repo : RepoEdge }}
      />
      <LegendPane list={RepoLegend} onLeft bottom />
    </ReactFlowProvider>
  );
};

export default RepoAutoMapView;
