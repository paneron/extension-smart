/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { ControlGroup } from '@blueprintjs/core';
import { jsx } from '@emotion/react';
import Workspace from '@riboseinc/paneron-extension-kit/widgets/Workspace';
import React from 'react';
import { MMELDocument } from '../../model/document';
import SMARTDocumentView from '../mapper/document/DocumentView';

const DocumentReferenceView: React.FC<{
  className?: string;
  document: MMELDocument;  
  menuControl: React.ReactNode;
}> = function (props) {
  const { className, document, menuControl } = props;

  const toolbar = <ControlGroup>{menuControl}</ControlGroup>;  

  return (
    <Workspace
      className={className}
      toolbar={toolbar}      
    >
      <SMARTDocumentView
        document={document}        
      />
    </Workspace>
  );
};

export default DocumentReferenceView;
