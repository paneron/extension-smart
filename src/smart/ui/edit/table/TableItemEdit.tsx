/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { jsx } from '@emotion/react';
import { Button, ButtonGroup, FormGroup } from '@blueprintjs/core';
import { MMELTable } from '../../../serialize/interface/supportinterface';
import { NormalTextField } from '../../common/fields';
import MMELTableRow from './TableRow';
import { useContext, useMemo } from 'react';
import {
  FILE_TYPE,
  handleFileOpen,
  saveToFileSystem,
} from '../../../utils/IOFunctions';
import { DatasetContext } from '@riboseinc/paneron-extension-kit/context';
import { Tooltip2 } from '@blueprintjs/popover2';

const TableItemEditPage: React.FC<{
  object: MMELTable;
  setObject: (obj: MMELTable) => void;
}> = ({ object: table, setObject: setTable }) => {
  const {
    getBlob,
    writeFileToFilesystem,
    useDecodedBlob,
    requestFileFromFilesystem,
  } = useContext(DatasetContext);

  const emptyRow = useMemo(
    () => new Array(table.columns).fill(''),
    [table.columns]
  );

  function setRow(index: number, row: string[]) {
    const newTable = [...table.data];
    newTable[index] = row;
    setTable({ ...table, data: newTable });
  }

  function onDeleteRow(index: number) {
    const newTable = [...table.data];
    newTable.splice(index, 1);
    setTable({ ...table, data: newTable });
  }

  function newRow(row: string[]) {
    setTable({ ...table, data: [...table.data, row] });
  }

  function onDelete(index: number) {
    const newTable = table.data.map(r => {
      const newRow = [...r];
      newRow.splice(index, 1);
      return newRow;
    });
    setTable({ ...table, columns: table.columns - 1, data: newTable });
  }

  function addColumn() {
    const newTable = table.data.map(r => [...r, '']);
    setTable({ ...table, columns: table.columns + 1, data: newTable });
  }

  function saveCSV() {
    const fileData = table.data.map(row => row.join(',')).join('\n');
    saveToFileSystem({
      getBlob,
      writeFileToFilesystem,
      fileData,
      type: FILE_TYPE.CSV,
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
    setTable({ ...table, columns: maxLength, data: cells });
  }

  function loadCSV() {
    handleFileOpen({
      useDecodedBlob,
      requestFileFromFilesystem,
      type: FILE_TYPE.CSV,
      postProcessing: x => parseTable(x),
    });
  }

  return (
    <FormGroup>
      <NormalTextField
        text="Table ID"
        value={table.id}
        onChange={x => setTable({ ...table, id: x.replaceAll(/\s+/g, '') })}
      />
      <NormalTextField
        text="Table title"
        value={table.title}
        onChange={x => setTable({ ...table, title: x })}
      />
      <table>
        <tr>
          <td />
          {emptyRow.map(
            (_, index) =>
              table.columns > 1 && (
                <td style={{ textAlign: 'center' }}>
                  <Tooltip2 content="Remove column">
                    <Button
                      intent="danger"
                      icon="cross"
                      minimal
                      onClick={() => onDelete(index)}
                    />
                  </Tooltip2>
                </td>
              )
          )}
          <td>
            <Button intent="success" onClick={addColumn}>
              Add column
            </Button>
          </td>
        </tr>
        {table.data.map((row, index) => (
          <MMELTableRow
            key={index}
            row={row}
            line={index}
            setRow={row => setRow(index, row)}
            onDelete={() => onDeleteRow(index)}
          />
        ))}
        <MMELTableRow row={emptyRow} setRow={newRow} />
      </table>
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
