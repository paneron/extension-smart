import React from 'react';
import type { DocSection, DocStatement } from '@/smart/model/document';
import ParagraphEdit from '@/smart/ui/doc/ParagraphEdit';

const SectionEdit: React.FC<{
  sec: DocSection;
  statements: Record<string, DocStatement>;
}> = function (props) {
  const { sec } = props;
  return (
    <div
      style={{
        marginLeft  : '20px',
        marginRight : '20px',
        marginTop   : '20px',
      }}
    >
      {sec.contents.map((para, index) => (
        <ParagraphEdit
          {...props}
          key={index}
          para={para}
          showSection={index === 0 ? sec.id : undefined}
          isHeader={sec.id === 'h'}
        />
      ))}
    </div>
  );
};

export default SectionEdit;
