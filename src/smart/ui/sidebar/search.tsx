/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { InputGroup } from '@blueprintjs/core';
import { jsx } from '@emotion/react';
import React, { useMemo, useState } from 'react';
import { search_result_container, search_result_entry_row } from '../../../css/shame';
import MGDButton from '../../MGDComponents/MGDButton';
import MGDContainer from '../../MGDComponents/MGDContainer';
import MGDLabel from '../../MGDComponents/MGDLabel';
import MGDSidebar from '../../MGDComponents/MGDSidebar';
import { EditorModel } from '../../model/editormodel';
import { PageHistory } from '../../model/history';
import { findComponent, SearchComponentRecord } from '../../utils/SearchFunctions';

const RECORD_PER_PAGE = 10;

const SearchComponentPane: React.FC<{
  model: EditorModel;
  onChange: (pageid: string, history: PageHistory) => void;
}> = function ({ model, onChange }) {
  const [search, setSearch] = useState<string>('');
  const result = useMemo(() => 
    findComponent(model, search)
  , [model, search]);  

  return (
    <MGDSidebar>
      <InputGroup          
          leftIcon='search'
          onChange={x => setSearch((x.target as HTMLInputElement).value)}
          className='bp3-round'
          placeholder="Find..."
          value={search}
      />      
      <SearchResultPane result={result} onChange={onChange}/>
    </MGDSidebar>
  );
}

const SearchResultPane: React.FC<{
  result: SearchComponentRecord[];
  onChange: (pageid: string, history: PageHistory) => void;
}> = function ({ result, onChange }) {
  const [page, setPage] = useState<number>(0);
  if (result.length === 0) {
    return <MGDLabel> No result </MGDLabel>
  }
  const records = result.slice(page*RECORD_PER_PAGE, Math.min((page+1)*RECORD_PER_PAGE, result.length));  
  return (
    <div css={search_result_container}>
      <MGDContainer>
        <MGDLabel>
          Total results: {result.length}
        </MGDLabel>
      </MGDContainer>
      {records.map( r => (
        <SearchResultEntry 
          key={`searchentry$page${page}#${r.id}`}
          entry={r}
          onClick={() => onChange(r.page, r.history)}
        />
      ))}
    </div>
  );
}

const SearchResultEntry: React.FC<{
  entry: SearchComponentRecord;
  onClick: () => void;
}> = function ({ entry, onClick }) {
  return (
    <div css={search_result_entry_row}>
      <MGDLabel>
        {entry.id} ( {entry.type} )
      </MGDLabel>
      <MGDButton onClick={onClick}> Go </MGDButton>
    </div>
  )
}

export default SearchComponentPane;