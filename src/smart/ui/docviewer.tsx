import { MMELRepo } from '../model/repo';
import Workspace from '@riboseinc/paneron-extension-kit/widgets/Workspace';
import SMARTDocumentView from './mapper/document/DocumentView';
import { useContext } from 'react';
import { DatasetContext } from '@riboseinc/paneron-extension-kit/context';
import { getPathByNS, RepoFileType } from '../utils/repo/io';
import { MMELDocument } from '../model/document';
import { LoadingScreen } from './common/Loading';
import React from 'react';
import { DOCVERSION } from '../utils/constants';

const DocumentViewer: React.FC<{
  isVisible: boolean;
  className?: string;
  repo?: MMELRepo;
}> = ({ isVisible, className, repo }) => {
  const { useObjectData } = useContext(DatasetContext);

  const repoPath = getPathByNS(repo ? repo.ns : '', RepoFileType.MODEL);
  const repoModelFile = useObjectData({
    objectPaths: [repoPath],
  });
  const doc = repoModelFile.value.data[repoPath] as MMELDocument;
  if (doc && doc.version !== DOCVERSION) {
    alert(
      `Warning: Document version not matched\nDocument version of the file:${doc.version}`
    );
    doc.version = DOCVERSION;
  }

  if (isVisible) {
    if (repo !== undefined && doc) {
      return (
        <Workspace className={className}>
          <SMARTDocumentView mmelDoc={doc} isRepo />
        </Workspace>
      );
    } else {
      return <LoadingScreen />;
    }
  }
  return <div></div>;
};

export default DocumentViewer;
