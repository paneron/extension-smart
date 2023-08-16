import Workspace from '@riboseinc/paneron-extension-kit/widgets/Workspace';
import React, { useState } from 'react';
import { MMELDocument } from '@/smart/model/document';
import { createNewMMELDocument } from '@/smart/utils/EditorFactory';
import SMARTDocumentEdit from '@/smart/ui/doc/SMARTDocumentEdit';
import DocEditToolbar from '@/smart/ui/menu/DocEditToolbar';

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
