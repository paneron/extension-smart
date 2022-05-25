import React from 'react';
import {
  DocMapIndex,
  DocParagraph,
  DocStatement,
} from '../../../model/document';
import StatementView from './StatementView';

const ParagraphView: React.FC<{
  para: DocParagraph;
  statements: Record<string, DocStatement>;
  title: string;
  showSection?: string;
  setMapping?: (from: string, to: string) => void;
  docMap?: DocMapIndex;
  diffDocMap?: DocMapIndex;
  MappingList?: React.FC<{ id: string }>;
  setSelected?: (id: string) => void;
  isHeader: boolean;
}> = function (props) {
  const { para, showSection, statements, docMap, diffDocMap } = props;
  return (
    <div
      style={{
        marginTop : '10px',
      }}
    >
      {para.map((s, index) => (
        <StatementView
          key={s}
          showSection={showSection}
          first={index === 0}
          statement={statements[s]}
          froms={docMap !== undefined ? docMap[s] ?? [] : undefined}
          oldHasMap={diffDocMap ? (diffDocMap[s] ?? []).length > 0 : undefined}
          {...props}
        />
      ))}
    </div>
  );
};

export default ParagraphView;
