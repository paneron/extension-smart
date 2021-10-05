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
  setMapping?: (fromid: string, toid: string) => void;
  mapSet?: MapSet;
  onDragOver?: (event: React.DragEvent<HTMLDivElement>) => void;
  onMouseUp?: () => void;
  MappingList?: React.FC<{ id: string }>;
  setSelected?: (id: string) => void;
}> = function (props) {
  const { document, onDragOver, mapSet, setSelected, onMouseUp } = props;
  const docMap = useMemo(
    () =>
      mapSet !== undefined
        ? calculateDocumentMapping(mapSet.mappings)
        : undefined,
    [mapSet?.mappings]
  );

  return (
    <div
      style={{
        height:
          mapSet !== undefined ? 'calc(100vh - 100px)' : 'calc(100vh - 50px)',
        overflowY: 'auto',
      }}
      onDragOver={onDragOver}
      onMouseUp={onMouseUp}
      onScroll={setSelected !== undefined ? () => setSelected('') : undefined}
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
