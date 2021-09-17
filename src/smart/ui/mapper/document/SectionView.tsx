/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { jsx } from '@emotion/react';
import { DocMapIndex, DocSection, DocStatement } from '../../../model/document';
import ParagraphView from './ParagraphView';

const SectionView:React.FC<{
  sec: DocSection;
  statements: Record<string, DocStatement>;
  setMapping: (from:string, to:string) => void;
  docMap: DocMapIndex;
}> = function ({ sec, statements, setMapping, docMap }) {
  return (
    <div 
      style={{
        marginLeft: '20px',
        marginRight: '20px',
        marginTop: '20px',
      }}
    >
      {sec.contents.map( (para, index) => (
        <ParagraphView 
          key={index} 
          para={para} 
          showSection={index===0?sec.id:undefined} 
          statements={statements}
          setMapping={setMapping}
          docMap={docMap}
        />
      ))}
    </div>
  );
}

export default SectionView;