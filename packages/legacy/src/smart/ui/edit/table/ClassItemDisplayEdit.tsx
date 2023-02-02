import { Button } from '@blueprintjs/core';
import React, { useState } from 'react';
import MGDButtonGroup from '../../../MGDComponents/MGDButtonGroup';
import MGDDisplayPane from '../../../MGDComponents/MGDDisplayPane';
import { MMELTable } from '@paneron/libmmel/interface/supportinterface';
import { ReferenceSelector } from '../../common/fields';

const ClassItemDisplayEdit: React.FC<{
  table: MMELTable;
  setTable: (t: MMELTable) => void;
  done: () => void;
}> = function ({ table, setTable, done }) {
  const [data, setData] = useState<string>(table.classDisplay ?? '');

  const header = table.data.length > 0 ? table.data[0] : [];
  const set = new Set<string>();
  header.forEach(x => {
    if (x !== '') {
      set.add(x);
    }
  });
  const types = [...set];

  function update() {
    setTable({ ...table, classDisplay : data });
    done();
  }

  return (
    <MGDDisplayPane>
      <ReferenceSelector
        text="Class item display"
        filterName="Class attribute"
        editable={true}
        value={data}
        options={types}
        update={x => setData(`${data}[${types[x]}]`)}
        onChange={x => setData(x)}
      />
      <MGDButtonGroup>
        <Button icon="edit" onClick={update}>
          Update
        </Button>
        <Button icon="disable" onClick={done}>
          Cancel
        </Button>
      </MGDButtonGroup>
    </MGDDisplayPane>
  );
};

export default ClassItemDisplayEdit;
