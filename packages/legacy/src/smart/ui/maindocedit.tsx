import Workspace from '@riboseinc/paneron-extension-kit/widgets/Workspace';
import React, { useState } from 'react';
import { MMELDocument } from '../model/document';
import { createNewMMELDocument } from '../utils/EditorFactory';
import SMARTDocumentEdit from './doc/SMARTDocumentEdit';
import DocEditToolbar from './menu/DocEditToolbar';

const DocumentEdit: React.FC<{
  isVisible: boolean;
  className?: string;
}> = ({ isVisible, className }) => {
  const [doc, setDoc] = useState<MMELDocument>(createNewMMELDocument());

  const toolbarProps = { doc, setDoc };

  if (isVisible) {
    return (
      <Workspace
        className={className}
        toolbar={<DocEditToolbar {...toolbarProps} />}
      >
        <SMARTDocumentEdit doc={doc} setDoc={setDoc} />
      </Workspace>
    );
  }
  return <div></div>;
};

export default DocumentEdit;
