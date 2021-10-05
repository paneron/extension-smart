/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { ControlGroup } from '@blueprintjs/core';
import { jsx } from '@emotion/react';
import Workspace from '@riboseinc/paneron-extension-kit/widgets/Workspace';
import React, { useEffect } from 'react';
import { MMELDocument } from '../../model/document';
import { ProvisionSelection } from '../../model/provisionImport';
import SMARTDocumentView from '../mapper/document/DocumentView';

const DocumentReferenceView: React.FC<{
  className?: string;
  document: MMELDocument;
  menuControl: React.ReactNode;
  setPImport: (x: ProvisionSelection | undefined) => void;
}> = function (props) {
  const { className, document, menuControl, setPImport } = props;

  const toolbar = <ControlGroup>{menuControl}</ControlGroup>;

  function onSelection() {
    const selection = window.getSelection();
    if (selection !== null) {
      const text = selection.toString().trim();
      const parent = selection.anchorNode?.parentNode;
      if (text !== '' && parent !== null) {
        const elm = parent as HTMLSpanElement;
        if (elm.attributes !== undefined) {
          const att = elm.attributes.getNamedItem('data-clause');
          if (att !== null) {
            const clause = att.value;
            setPImport({
              text,
              clause,
              namespace: document.id,
              doc: document.title,
            });
            return;
          }
        }
      }
    }
    setPImport(undefined);
  }

  function cleanup() {
    setPImport(undefined);
  }

  useEffect(() => cleanup, [document]);

  return (
    <Workspace className={className} toolbar={toolbar}>
      <SMARTDocumentView document={document} onMouseUp={onSelection} />
    </Workspace>
  );
};

export default DocumentReferenceView;
