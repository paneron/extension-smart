import { Button, InputGroup } from '@blueprintjs/core';
import React, { useMemo, useState } from 'react';
import { searchResultEntryRow } from '@/css/shame';
import MGDContainer from '@/smart/MGDComponents/MGDContainer';
import MGDLabel from '@/smart/MGDComponents/MGDLabel';
import MGDSidebar from '@/smart/MGDComponents/MGDSidebar';
import { EditorModel } from '@/smart/model/editormodel';
import { HistoryItem } from '@/smart/model/history';
import * as Logger from '@/lib/logger';
import {
  findComponent,
  SearchComponentRecord,
} from '../../utils/SearchFunctions';
import { NumericComboBox } from '@/smart/ui/common/fields';

const RECORD_PER_PAGE = 10;

const SearchComponentPane: React.FC<{
  model: EditorModel;
  onChange: (selected: string, history: HistoryItem[]) => void;
  resetSearchElements: (set: Set<string>) => void;
}> = function ({ model, onChange, resetSearchElements }) {
  const [search, setSearch] = useState<string>('');

  const result = useMemo(() => {
    try {
      const result = findComponent(model, search);
      const set = new Set<string>();
      for (const r of result) {
        set.add(r.id);
      }
      resetSearchElements(set);
      return result;
    } catch (e: unknown) {
      if (typeof e === 'object') {
        const error = e as Error;
        Logger.log(error.message);
        Logger.log(error.stack);
      }
    }
    return [];
  }, [model, search]);

  return (
    <MGDSidebar>
      <InputGroup
        leftIcon="search"
        onChange={x => setSearch((x.target as HTMLInputElement).value)}
        className="bp3-round"
        placeholder="Find..."
        rightElement={<Button icon="cross" onClick={() => setSearch('')} />}
        value={search}
      />
      <SearchResultPane
        key={search.replaceAll('/s+/g', '')}
        result={result}
        onChange={onChange}
      />
    </MGDSidebar>
  );
};

const SearchResultPane: React.FC<{
  key: string;
  result: SearchComponentRecord[];
  onChange: (selected: string, history: HistoryItem[]) => void;
}> = function ({ key, result, onChange }) {
  const [page, setPage] = useState<number>(0);
  if (result.length === 0) {
    return (
      <MGDContainer>
        <MGDLabel> No result </MGDLabel>
      </MGDContainer>
    );
  }
  const records = result.slice(
    page * RECORD_PER_PAGE,
    Math.min((page + 1) * RECORD_PER_PAGE, result.length)
  );
  const maxpage = Math.floor((result.length - 1) / RECORD_PER_PAGE + 1);
  const pageOptions = Array.from(Array(maxpage).keys()).map(v => v + 1);

  return (
    <div>
      <MGDContainer>
        <MGDLabel>Total results: {result.length}</MGDLabel>
      </MGDContainer>
      {records.map((r, index) => (
        <SearchResultEntry
          key={`searchentry#${key}#page${page}#${index}`}
          pos={page * RECORD_PER_PAGE + index + 1}
          entry={r}
          onClick={() => onChange(r.id, r.history)}
        />
      ))}
      <MGDContainer>
        <Button
          disabled={page === 0}
          icon="caret-left"
          onClick={() => setPage(page - 1)}
        />
        <NumericComboBox
          options={pageOptions}
          value={page + 1}
          onChange={x => setPage(x - 1)}
        />
        <Button
          disabled={page === maxpage - 1}
          icon="caret-right"
          onClick={() => setPage(page + 1)}
        />
      </MGDContainer>
    </div>
  );
};

const SearchResultEntry: React.FC<{
  pos: number;
  entry: SearchComponentRecord;
  onClick: () => void;
}> = function ({ pos, entry, onClick }) {
  const hisotry = entry.history;
  const parent =
    hisotry.length > 1 ? hisotry[hisotry.length - 1].pathtext : 'root';
  return (
    <div style={searchResultEntryRow}>
      <a onClick={onClick}>
        {pos}. {entry.type} : {entry.text} @ {parent}
      </a>
    </div>
  );
};

export default SearchComponentPane;
