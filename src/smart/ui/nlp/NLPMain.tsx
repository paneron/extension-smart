/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { jsx } from '@emotion/react';
import { DatasetContext } from '@riboseinc/paneron-extension-kit/context';
import makeSidebar from '@riboseinc/paneron-extension-kit/widgets/Sidebar';
import Workspace from '@riboseinc/paneron-extension-kit/widgets/Workspace';
import React, { useContext, useEffect, useMemo, useState } from 'react';
import { ReactFlowProvider } from 'react-flow-renderer';
import { sidebar_layout } from '../../../css/layout';
import { MMELJSON } from '../../model/json';
import {
  createEditorModelWrapper,
  ModelWrapper,
} from '../../model/modelwrapper';
import { MMELRepo } from '../../model/repo';
import { ProvisionRDF, RDFVersion } from '../../model/SemanticTriple';
import { buildModelLinks } from '../../utils/ModelFunctions';
import { getPathByNS, JSONToMMEL, RepoFileType } from '../../utils/repo/io';
import { LoadingScreen } from '../common/Loading';
import RDFControlPane from './RDFControlPane';
import RDFDiagram from './RDFDiagram';
import RDFQueryPane from './RDFQueryPane';

const NLPMain: React.FC<{
  isVisible: boolean;
  repo?: MMELRepo;
  className?: string;
}> = function ({ isVisible, repo, className }) {
  const { useObjectData, usePersistentDatasetStateReducer } =
    useContext(DatasetContext);

  const Sidebar = useMemo(
    () => makeSidebar(usePersistentDatasetStateReducer!),
    []
  );

  const [mw, setMW] = useState<ModelWrapper | undefined>(undefined);
  const [rdf, setRDF] = useState<ProvisionRDF | undefined>(undefined);

  const modelPath = getPathByNS(repo ? repo.ns : '', RepoFileType.MODEL);
  const rdfPath = getPathByNS(repo ? repo.ns : '', RepoFileType.RDF);
  const repoFile = useObjectData({
    objectPaths: repo !== undefined ? [modelPath, rdfPath] : [],
  });
  const modelData = repoFile.value.data[modelPath];
  const rdfData = repoFile.value.data[rdfPath];

  useMemo(() => {
    if (!repoFile.isUpdating && modelData !== undefined) {
      const json = modelData as MMELJSON;
      const model = JSONToMMEL(json);
      const mw = createEditorModelWrapper(model);
      buildModelLinks(mw.model);
      setMW(mw);
      if (rdfData !== undefined && rdfData !== null) {
        if (rdfData.version === RDFVersion) {
          setRDF(rdfData as ProvisionRDF);
        }
      }
    }
  }, [modelData, repoFile.isUpdating]);

  function clean() {
    setMW(undefined);
    setRDF(undefined);
  }

  useEffect(() => clean, [repo]);

  const sidebar = (
    <Sidebar
      stateKey={`NLP-View-${jsx.length}`}
      css={sidebar_layout}
      title="Item metadata"
      blocks={[
        {
          key: 'NLP-control',
          title: 'Control panel',
          content:
            repo && mw ? (
              <RDFControlPane repo={repo} mw={mw} rdf={rdf} />
            ) : (
              <LoadingScreen label="Loading" />
            ),
        },
        {
          key: 'NLP-query',
          title: 'Ask a question',
          content: <RDFQueryPane rdf={rdf} />,
        },
      ]}
    />
  );

  if (isVisible && repo) {
    return (
      <Workspace className={className} sidebar={sidebar}>
        <ReactFlowProvider>
          {repo && mw ? (
            <RDFDiagram diagram={rdf} />
          ) : (
            <LoadingScreen label="Loading" />
          )}
        </ReactFlowProvider>
      </Workspace>
    );
  } else {
    return <></>;
  }
};

export default NLPMain;
