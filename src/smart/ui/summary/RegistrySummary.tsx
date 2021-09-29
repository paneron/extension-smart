/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { Text } from '@blueprintjs/core';
import { jsx } from '@emotion/react';
import { useMemo, useState } from 'react';
import {
  search_result_container,
  search_result_entry_row,
} from '../../../css/shame';
import MGDButton from '../../MGDComponents/MGDButton';
import MGDContainer from '../../MGDComponents/MGDContainer';
import MGDLabel from '../../MGDComponents/MGDLabel';
import MGDSidebar from '../../MGDComponents/MGDSidebar';
import { EditorModel, isEditorRegistry } from '../../model/editormodel';
import { PageHistory } from '../../model/history';
import {
  computeRegistrySummary,
  RegSummarySearchRecord,
} from '../../utils/summary/RegistrySummary';
import { NormalComboBox, NumericComboBox } from '../common/fields';

const RECORD_PER_PAGE = 10;

const RegistrySummary: React.FC<{
  model: EditorModel;
  onChange: (selected: string, pageid: string, history: PageHistory) => void;
  resetSearchElements: (set: Set<string>) => void;
}> = function ({ model, onChange, resetSearchElements }) {
  const regs = useMemo(
    () => Object.values(model.elements).filter(x => isEditorRegistry(x)),
    [model]
  );
  const options = useMemo(() => ['', ...regs.map(r => r.id)], [regs]);

  const [selected, setSelected] = useState<string>('');

  const result = useMemo(() => {
    const result = computeRegistrySummary(model, selected);
    const set = new Set<string>();
    for (const r of result) {
      set.add(r.id);
    }
    resetSearchElements(set);
    return result;
  }, [model, selected]);

  return (
    <MGDSidebar>
      {options.length > 1 ? (
        <NormalComboBox
          text="Registry"
          value={selected}
          options={options}
          onChange={x => setSelected(x)}
        />
      ) : (
        <Text>No registry found in the model</Text>
      )}
      <SearchResultPane key={selected} result={result} onChange={onChange} />
    </MGDSidebar>
  );
};

const SearchResultPane: React.FC<{
  key: string;
  result: RegSummarySearchRecord[];
  onChange: (selected: string, pageid: string, history: PageHistory) => void;
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
    <div css={search_result_container}>
      <MGDContainer>
        <MGDLabel>Total results: {result.length}</MGDLabel>
      </MGDContainer>
      {records.map((r, index) => (
        <SearchResultEntry
          key={`searchentry#${key}#page${page}#${index}`}
          pos={page * RECORD_PER_PAGE + index + 1}
          entry={r}
          onClick={() => onChange(r.id, r.page, r.history)}
        />
      ))}
      <MGDContainer>
        <MGDButton
          disabled={page === 0}
          icon="caret-left"
          onClick={() => setPage(page - 1)}
        />
        <NumericComboBox
          options={pageOptions}
          value={page + 1}
          onChange={x => setPage(x - 1)}
        />
        <MGDButton
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
  entry: RegSummarySearchRecord;
  onClick: () => void;
}> = function ({ pos, entry, onClick }) {
  const hisotry = entry.history.items;
  const parent =
    hisotry.length > 1 ? hisotry[hisotry.length - 1].pathtext : 'root';
  return (
    <div css={search_result_entry_row}>
      <a onClick={onClick}>
        {pos}. {entry.type} : {entry.text} @ {parent}
      </a>
    </div>
  );
};

export default RegistrySummary;
