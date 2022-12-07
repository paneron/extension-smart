import { Button, FormGroup, Text } from '@blueprintjs/core';
import React, { useState } from 'react';
import { ReactFlowProvider } from 'react-flow-renderer';
import MGDSidebar from '../../MGDComponents/MGDSidebar';
import { ProvisionRDF } from '../../model/SemanticTriple';
import { askRDF } from '../../utils/nlp/query';
import { NormalTextField } from '../common/fields';
import { LoadingContainer } from '../common/Loading';
import RDFDiagram from './RDFDiagram';

const RDFQueryPane: React.FC<{
  rdf?: ProvisionRDF;
}> = function ({ rdf }) {
  const [question, setQuestion] = useState<string>('');
  const [working, setWorking] = useState<boolean>(false);
  const [answer, setAnswer] = useState<string>('Ask your question first.');
  const [qrdf, setQRDF] = useState<ProvisionRDF | undefined>(undefined);
  const [score, setScore] = useState<number>(0);

  function solved(ans: string, qrdf: ProvisionRDF | undefined, score?: number) {
    setWorking(false);
    setQRDF(qrdf);
    setAnswer(ans);
    if (score !== undefined) {
      setScore(score);
    }
  }

  function ask() {
    setWorking(true);
    if (rdf) {
      askRDF(rdf, question, solved);
    }
  }

  return (
    <MGDSidebar>
      {rdf ? (
        <>
          <FormGroup>
            <NormalTextField
              text="Your question"
              value={question}
              onChange={working ? undefined : x => setQuestion(x)}
            />
            <Button disabled={working} onClick={ask}>
              Ask
            </Button>
            <Text>
              Note: This function requires the stanford CoreNLP server available
              at localhost:9000
            </Text>
            <div>
              {working ? (
                <LoadingContainer label="Searching" />
              ) : (
                <>
                  <NormalTextField text="Answer" value={answer} />
                  <Text>Score: {score}</Text>
                </>
              )}
            </div>
          </FormGroup>
        </>
      ) : (
        <Text>There is no knowledge graph yet. </Text>
      )}
      {qrdf && (
        <ReactFlowProvider>
          <div
            style={{
              backgroundColor : 'white',
              width           : '100%',
              height          : 200,
              display         : 'flex',
            }}
          >
            <RDFDiagram diagram={qrdf} />
          </div>
        </ReactFlowProvider>
      )}
    </MGDSidebar>
  );
};

export default RDFQueryPane;
