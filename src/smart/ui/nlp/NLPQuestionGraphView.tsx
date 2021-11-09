import { Button } from '@blueprintjs/core';
import React from 'react';
import { ProvisionRDF } from '../../model/SemanticTriple';
import RDFDiagram from './RDFDiagram';

const NLPQuestionGraphView: React.FC<{
  isVisible: boolean;
  onClose: () => void;
  rdf: ProvisionRDF | undefined;
}> = function ({ isVisible, onClose, rdf }) {
  return isVisible ? (
    <Container>
      <RDFDiagram diagram={rdf} />
      <CloseButton onClose={onClose} />
    </Container>
  ) : (
    <></>
  );
};

const Container: React.FC<{ children: React.ReactNode }> = function ({
  children,
}) {
  return (
    <div
      style={{
        position: 'fixed',
        bottom: 30,
        right: 20,
        width: '35vw',
        height: '30vh',
        borderStyle: 'solid',
        zIndex: 20,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white',
      }}
    >
      {children}
    </div>
  );
};

function CloseButton({ onClose }: { onClose: () => void }) {
  return (
    <Button
      style={{
        position: 'absolute',
        top: 2,
        right: 2,
        zIndex: 21,
      }}
      icon="cross"
      minimal
      onClick={onClose}
    />
  );
}

export default NLPQuestionGraphView;
