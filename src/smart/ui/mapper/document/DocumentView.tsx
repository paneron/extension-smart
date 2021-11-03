import React from 'react';
import { useMemo } from 'react';
import { MMELDocument } from '../../../model/document';
import { MapSet } from '../../../model/mapmodel';
import { calculateDocumentMapping } from '../../../utils/DocumentFunctions';
import SectionView from './SectionView';

const SMARTDocumentView: React.FC<{
  mmelDoc: MMELDocument;
  setMapping?: (fromid: string, toid: string) => void;
  mapSet?: MapSet;
  onDragOver?: (event: React.DragEvent<HTMLDivElement>) => void;
  MappingList?: React.FC<{ id: string }>;
  setSelected?: (id: string) => void;
  isRepo?: boolean;
}> = function (props) {
  const { mmelDoc, onDragOver, mapSet, setSelected, isRepo } = props;
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
        height: isRepo
          ? 'calc(100vh - 25px)'
          : mapSet !== undefined
          ? 'calc(100vh - 100px)'
          : 'calc(100vh - 50px)',
        overflowY: 'auto',
      }}
      onDragOver={onDragOver}
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
        {mmelDoc.title}
      </h2>
      {mmelDoc.sections.map(sec => (
        <SectionView
          key={sec.id}
          sec={sec}
          statements={mmelDoc.states}
          docMap={docMap}
          {...props}
        />
      ))}
    </div>
  );
};

export default SMARTDocumentView;
