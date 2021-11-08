import React from 'react';
import ReactFlow from 'react-flow-renderer';
import { reactFlowContainerLayout } from '../../../css/layout';
import { ProvisionRDF } from '../../model/SemanticTriple';
import { getElementsFromRDF } from '../../utils/nlp/nlp';

const RDFDiagram: React.FC<{
  rdf: ProvisionRDF | undefined | null;
}> = function ({ rdf }) {
  return (
    <div style={reactFlowContainerLayout}>
      <ReactFlow
        elements={getElementsFromRDF(rdf)}
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
