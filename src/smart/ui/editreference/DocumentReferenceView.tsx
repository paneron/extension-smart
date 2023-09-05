import { ControlGroup } from '@blueprintjs/core';
import Workspace from '@riboseinc/paneron-extension-kit/widgets/Workspace';
import React, { useEffect } from 'react';
import type { MMELDocument } from '@/smart/model/document';
import type { RefTextSelection } from '@/smart/model/selectionImport';
import SMARTDocumentView from '@/smart/ui/mapper/document/DocumentView';

const DocumentReferenceView: React.FC<{
  className?: string;
  document: MMELDocument;
  menuControl: React.ReactNode;
  setPImport: (x: RefTextSelection | undefined) => void;
  setClickListener: (f: (() => void)[]) => void;
}> = function (props) {
  const { className, document, menuControl, setPImport, setClickListener } =
    props;

  const toolbar = <ControlGroup>{menuControl}</ControlGroup>;

  function onSelection() {
    const selection = window.getSelection();
    if (selection !== null) {
      const text = selection.toString().trim();
      const parent = selection.anchorNode?.parentNode;
      if (text !== '' && parent !== null) {
        const elm = parent as HTMLSpanElement;
        if (elm.attributes !== undefined) {
          const clauseAtt = elm.attributes.getNamedItem('data-clause');
          const titleAtt = elm.attributes.getNamedItem('data-title');
          if (clauseAtt !== null) {
            const clause = clauseAtt.value;
            const clauseTitle = titleAtt !== null ? titleAtt.value : '';
            setPImport({
              text,
              clause,
              clauseTitle,
              namespace : document.id,
              doc       : document.title,
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
    setClickListener([]);
  }

  useEffect(() => {
    setClickListener([onSelection]);
    return cleanup;
  }, [document]);

  return (
    <Workspace className={className} toolbar={toolbar} style={{ flex : 2 }}>
      <SMARTDocumentView mmelDoc={document} />
    </Workspace>
  );
};

export default DocumentReferenceView;
