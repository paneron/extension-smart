/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { Button } from '@blueprintjs/core';
import { Popover2 } from '@blueprintjs/popover2';
import { jsx } from '@emotion/react';
import React from 'react';
import { useState } from 'react';
import { DocStatement } from '../../../model/document';
import { DragAndDropMappingType } from '../../../utils/constants';

const StatementView: React.FC<{
  statement: DocStatement;
  showSection?: string;
  setMapping?: (from: string, to: string) => void;
  froms?: string[];
  first: boolean;
  MappingList?: React.FC<{ id: string }>;
  setSelected?: (id: string) => void;
  title: string;
}> = function ({
  statement,
  showSection,
  setMapping,
  first,
  froms,
  MappingList,
  setSelected,
  title,
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

  return (
    <>
      <span
        style={{
          marginLeft: first ? '0' : '3px',
          backgroundColor: hasMap
            ? 'lightgreen'
            : hover
            ? 'lightgray'
            : 'white',
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

export default StatementView;
