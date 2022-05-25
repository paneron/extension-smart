import React from 'react';
import { DocParagraph, DocStatement } from '../../model/document';
import StatementEdit from './StatementEdit';

const ParagraphEdit: React.FC<{
  para: DocParagraph;
  statements: Record<string, DocStatement>;
  showSection?: string;
  isHeader: boolean;
}> = function (props) {
  const { para, showSection, statements } = props;
  return (
    <div
      style={{
        marginTop : '10px',
      }}
    >
      {para.map((s, index) => (
        <StatementEdit
          key={s}
          showSection={showSection}
          first={index === 0}
          statement={statements[s]}
          {...props}
        />
      ))}
    </div>
  );
};

export default ParagraphEdit;
