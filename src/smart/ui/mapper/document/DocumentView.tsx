/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { jsx } from '@emotion/react';
import { useMemo } from 'react';
import { MMELDocument } from '../../../model/document';
import { MapSet } from '../../../model/mapmodel';
import { calculateDocumentMapping } from '../../../utils/DocumentFunctions';
import SectionView from './SectionView';

const SMARTDocumentView: React.FC<{
  document: MMELDocument;
  setMapping: (fromid: string, toid: string) => void;
  mapSet: MapSet;
  onDragOver: (event: React.DragEvent<HTMLDivElement>) => void;
  MappingList: React.FC<{ id: string }>;
  setSelected: (id: string) => void;
}> = function (props) {
  const { document, onDragOver, mapSet, setSelected } = props;
  const docMap = useMemo(
    () => calculateDocumentMapping(mapSet.mappings),
    [mapSet.mappings]
  );

  return (
    <div
      style={{
        height: 'calc(100vh - 100px)',
        overflowY: 'auto',
      }}
      onDragOver={onDragOver}
      onScroll={() => setSelected('')}
    >
      <h2
        style={{
          marginLeft: 'auto',
          marginRight: 'auto',
          width: '70%',
          textAlign: 'center',
        }}
      >
        {document.title}
      </h2>
      {document.sections.map(sec => (
        <SectionView
          key={sec.id}
          sec={sec}
          statements={document.states}
          docMap={docMap}
          {...props}
        />
      ))}
    </div>
  );
};

export default SMARTDocumentView;
