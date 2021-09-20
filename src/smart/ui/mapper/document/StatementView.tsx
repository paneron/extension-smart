/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { Button } from '@blueprintjs/core';
import { Popover2 } from '@blueprintjs/popover2';
import { jsx } from '@emotion/react';
import React from 'react';
import { useState } from 'react';
import { DocStatement } from '../../../model/document';

const StatementView: React.FC<{
  statement: DocStatement;
  showSection?: string;  
  setMapping: (from: string, to: string) => void;
  froms: string[];
  first: boolean;
  MappingList: React.FC<{ id: string }>;
  setSelected: (id: string) => void;
}> = function ({
  statement,  
  showSection,
  setMapping,
  first,
  froms,
  MappingList,
  setSelected
}) {
  const [hover, setHover] = useState<boolean>(false);
  const hasMap = froms.length > 0;

  function onDrop(e: React.DragEvent<unknown>) {
    const fromid = e.dataTransfer.getData('text');
    setMapping(fromid, statement.id);
  }

  function onMouseEnter() {
    setSelected(statement.id);
    setHover(true);
  }

  function onMouseLeave() {
    setSelected('');
    setHover(false);
  }

  const content = (showSection !== undefined ? `${showSection}. ` : '') + statement.text;

  return (         
    <>
      <span
        style={{
          marginLeft: first?'0':'3px',
          backgroundColor: hasMap
            ? 'lightgreen'
            : hover
            ? 'lightgray'
            : 'white',
        }}
        ref={statement.uiref}
        onDrop={onDrop}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onDragEnter={() => setHover(true)}
        onDragLeave={() => setHover(false)}
      >        
        {content}            
        {hasMap &&
          <Popover2 content={<MappingList id={statement.id}/>} position='top'>
            <Button small icon='link' />
          </Popover2>
        }
      </span>      
    </>
  );
};

export default StatementView;
