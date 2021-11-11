import { Button } from '@blueprintjs/core';
import { Popover2 } from '@blueprintjs/popover2';
import React from 'react';
import { useState } from 'react';
import { DocStatement } from '../../../model/document';
import { DragAndDropMappingType } from '../../../utils/constants';

const StatementView: React.FC<{
  statement: DocStatement;
  showSection?: string;
  setMapping?: (from: string, to: string) => void;
  froms?: string[];
  oldHasMap?: boolean;
  first: boolean;
  MappingList?: React.FC<{ id: string }>;
  setSelected?: (id: string) => void;
  title: string;
  isHeader: boolean;
}> = function ({
  statement,
  showSection,
  setMapping,
  first,
  froms,
  oldHasMap,
  MappingList,
  setSelected,
  title,
  isHeader,
}) {
  const [hover, setHover] = useState<boolean>(false);
  const hasMap = froms !== undefined && froms.length > 0;

  function onDrop(e: React.DragEvent<unknown>) {
    if (setMapping !== undefined) {
      const fromid = e.dataTransfer.getData(DragAndDropMappingType);
      setMapping(fromid, statement.id);
    }
  }

  function onMouseEnter() {
    if (setSelected !== undefined) {
      setSelected(statement.id);
      setHover(true);
    }
  }

  function onMouseLeave() {
    if (setSelected !== undefined) {
      setSelected('');
      setHover(false);
    }
  }

  const content =
    (showSection !== undefined ? `${showSection}. ` : '') + statement.text;

  return isHeader ? (
    <div style={{ textAlign: 'center' }}>
      <h4>{statement.text}</h4>
    </div>
  ) : (
    <>
      <span
        style={{
          marginLeft: first ? '0' : '3px',
          backgroundColor: getStyle(hasMap, hover, oldHasMap),
        }}
        ref={statement.uiref}
        onDrop={setMapping !== undefined ? onDrop : undefined}
        onMouseEnter={setSelected !== undefined ? onMouseEnter : undefined}
        onMouseLeave={setSelected !== undefined ? onMouseLeave : undefined}
        onDragEnter={() => setHover(true)}
        onDragLeave={() => setHover(false)}
        data-clause={statement.clause}
        data-title={title}
      >
        {content}
        {hasMap && MappingList !== undefined && (
          <Popover2 content={<MappingList id={statement.id} />} position="top">
            <Button small icon="link" />
          </Popover2>
        )}
      </span>
    </>
  );
};

function getStyle(
  hasMap: boolean,
  hover: boolean,
  oldHasMap?: boolean
): string {
  if (oldHasMap === undefined) {
    if (hasMap) {
      return 'lightgreen';
    }
  } else {
    if (hasMap && oldHasMap) {
      return 'lightblue';
    } else if (hasMap) {
      return 'lightgreen';
    } else if (oldHasMap) {
      return 'lightpink';
    }
  }
  return hover ? 'lightgray' : 'white';
}

export default StatementView;
