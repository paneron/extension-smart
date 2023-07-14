import { Button, ButtonGroup, FormGroup, Tab, Tabs } from '@blueprintjs/core';
import { MMELTable } from '@paneron/libmmel/interface/supportinterface';
import { NormalTextField } from '@/smart/ui/common/fields';
import { useContext, useState } from 'react';
import {
  FILE_TYPE,
  handleFileOpen,
  saveToFileSystem,
} from '@/smart/utils/IOFunctions';
import { DatasetContext } from '@riboseinc/paneron-extension-kit/context';
import EditTableView from '@/smart/ui/edit/table/EditTableView';
import EditClassView from '@/smart/ui/edit/table/EditClassView';
import React from 'react';

type TabType = 'table' | 'class';

const TableItemEditPage: React.FC<{
  object: MMELTable;
  setObject: (obj: MMELTable) => void;
}> = ({ object: table, setObject: setTable }) => {
  const [mode, setMode] = useState<TabType>('table');

  const { getBlob, writeFileToFilesystem, requestFileFromFilesystem } =
    useContext(DatasetContext);

  function saveCSV() {
    const fileData = table.data.map(row => row.join(',')).join('\n');
    saveToFileSystem({
      getBlob,
      writeFileToFilesystem,
      fileData,
      type : FILE_TYPE.CSV,
    });
  }

  function parseTable(data: string) {
    const lines = data.replaceAll('\r', '').split('\n');
    const cells = lines.map(l => l.split(','));
    const maxLength = cells.reduce((max, l) => Math.max(max, l.length), 0);
    for (const line of cells) {
      while (line.length < maxLength) {
        line.push('');
      }
    }
    setTable({ ...table, columns : maxLength, data : cells });
  }

  function loadCSV() {
    handleFileOpen({
      requestFileFromFilesystem,
      type           : FILE_TYPE.CSV,
      postProcessing : x => parseTable(x),
    });
  }

  const props = { table, setTable };

  return (
    <FormGroup>
      <NormalTextField
        text="Table ID"
        value={table.id}
        onChange={x => setTable({ ...table, id : x.replaceAll(/\s+/g, '') })}
      />
      <NormalTextField
        text="Table title"
        value={table.title}
        onChange={x => setTable({ ...table, title : x })}
      />
      <Tabs
        id="TableEditOption"
        onChange={x => setMode(x as TabType)}
        selectedTabId={mode}
      >
        <Tab
          id="table"
          title="Table view"
          panel={mode === 'table' ? <EditTableView {...props} /> : <></>}
        />
        <Tab
          id="class"
          title="Class view"
          panel={mode === 'class' ? <EditClassView {...props} /> : <></>}
        />
      </Tabs>
      <ButtonGroup>
        <Button icon="import" onClick={loadCSV}>
          Import CSV
        </Button>
        <Button icon="export" onClick={saveCSV}>
          Export CSV
        </Button>
      </ButtonGroup>
    </FormGroup>
  );
};

export default TableItemEditPage;
