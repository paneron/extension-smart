import React from 'react';
import type { MMELDocument } from '@/smart/model/document';
import SectionEdit from '@/smart/ui/doc/SectionEdit';

const SMARTDocumentEdit: React.FC<{
  doc: MMELDocument;
  setDoc: (x: MMELDocument) => void;
}> = function (props) {
  const { doc } = props;

  return (
    <div
      style={{
        height    : 'calc(100vh - 50px)',
        overflowY : 'auto',
      }}
    >
      <h2
        style={{
          marginLeft  : 'auto',
          marginRight : 'auto',
          width       : '70%',
          textAlign   : 'center',
        }}
      >
        {doc.title}
      </h2>
      {doc.sections.map(sec => (
        <SectionEdit
          key={sec.id}
          sec={sec}
          statements={doc.states}
          {...props}
        />
      ))}
    </div>
  );
};

export default SMARTDocumentEdit;
