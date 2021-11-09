import React, { useMemo } from 'react';
import ReactFlow from 'react-flow-renderer';
import { reactFlowContainerLayout } from '../../../css/layout';
import { ProvisionRDF } from '../../model/SemanticTriple';
import { getElementsFromRDF } from '../../utils/nlp/nlp';

const RDFDiagram: React.FC<{
  diagram: ProvisionRDF | undefined | null;
}> = function ({ diagram }) {
  const elms = useMemo(() => getElementsFromRDF(diagram), [diagram]);

  return (
    <div style={reactFlowContainerLayout}>
      <ReactFlow
        elements={elms}
        onLoad={params => params.fitView()}
        nodesConnectable={false}
        snapToGrid={true}
        snapGrid={[10, 10]}
        nodesDraggable={true}
      />
    </div>
  );
};

export default RDFDiagram;
