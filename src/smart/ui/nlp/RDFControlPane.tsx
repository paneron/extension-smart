import { Button, Text } from '@blueprintjs/core';
import { DatasetContext } from '@riboseinc/paneron-extension-kit/context';
import React, { useContext, useState } from 'react';
import MGDSidebar from '@/smart/MGDComponents/MGDSidebar';
import { ModelWrapper } from '@/smart/model/modelwrapper';
import { MMELRepo } from '@/smart/model/repo';
import { ProvisionRDF } from '@/smart/model/SemanticTriple';
import { computeRDF } from '@/smart/utils/nlp/nlp';
import { COMMITMSG, getPathByNS, RepoFileType } from '@/smart/utils/repo/io';
import { DescriptionItem } from '@/smart/ui/common/description/fields';
import { LoadingScreen } from '@/smart/ui/common/Loading';

const RDFControlPane: React.FC<{
  repo: MMELRepo;
  mw: ModelWrapper;
  rdf: ProvisionRDF | undefined;
}> = function (props) {
  const { updateObjects } = useContext(DatasetContext);

  const { repo, mw, rdf } = props;
  const [working, setWorking] = useState<boolean>(false);

  function updateRDF(rdf: ProvisionRDF) {
    if (updateObjects) {
      const path = getPathByNS(repo.ns, RepoFileType.RDF);
      const task = updateObjects({
        commitMessage              : COMMITMSG,
        _dangerouslySkipValidation : true,
        objectChangeset            : {
          [path] : { newValue : rdf },
        },
      });
      task.then(() => {
        setWorking(false);
      });
      setWorking(false);
    }
  }

  function genGraph() {
    setWorking(true);
    computeRDF(mw).then(updateRDF);
  }

  return (
    <MGDSidebar>
      {working ? (
        <LoadingScreen label="Calculaing" />
      ) : (
        <>
          <DescriptionItem
            label="Current model"
            value={
              mw.model.meta.shortname !== ''
                ? mw.model.meta.shortname
                : `[${repo.ns}]`
            }
          />
          <DescriptionItem
            label="Knowledge graph"
            value={rdf ? 'Ready' : 'No data'}
          />
          <Button onClick={genGraph}>Generate knowledge graph</Button>
          <Text>
            Note: This function requires the stanford CoreNLP server available
            at localhost:9000
          </Text>
        </>
      )}
    </MGDSidebar>
  );
};

export default RDFControlPane;
