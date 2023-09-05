import React from 'react';
import type { DocMapIndex, DocSection, DocStatement } from '@/smart/model/document';
import ParagraphView from '@/smart/ui/mapper/document/ParagraphView';

const SectionView: React.FC<{
  sec: DocSection;
  statements: Record<string, DocStatement>;
  setMapping?: (from: string, to: string) => void;
  docMap?: DocMapIndex;
  diffDocMap?: DocMapIndex;
  MappingList?: React.FC<{ id: string }>;
  setSelected?: (id: string) => void;
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
        <ParagraphView
          {...props}
          key={index}
          para={para}
          showSection={index === 0 ? sec.id : undefined}
          title={sec.title ?? ''}
          isHeader={sec.id === 'h'}
        />
      ))}
    </div>
  );
};

export default SectionView;
