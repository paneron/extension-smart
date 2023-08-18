import { Button } from '@blueprintjs/core';
import { Tooltip2 } from '@blueprintjs/popover2';
import React from 'react';
import { useMemo } from 'react';
import type { MMELTable } from '@paneron/libmmel/interface/supportinterface';
import MMELTableRow from '@/smart/ui/edit/table/TableRow';

const EditTableView: React.FC<{
  table: MMELTable;
  setTable: (x: MMELTable) => void;
}> = function ({ table, setTable }) {
  const emptyRow = useMemo(
    () => new Array(table.columns).fill(''),
    [table.columns]
  );

  function setRow(index: number, row: string[]) {
    const newTable = [...table.data];
    newTable[index] = row;
    setTable({ ...table, data : newTable });
  }

  function onDeleteRow(index: number) {
    const newTable = [...table.data];
    newTable.splice(index, 1);
    setTable({ ...table, data : newTable });
  }

  function newRow(row: string[]) {
    setTable({ ...table, data : [...table.data, row]});
  }

  function onDelete(index: number) {
    const newTable = table.data.map(r => {
      const newRow = [...r];
      newRow.splice(index, 1);
      return newRow;
    });
    const newDomain = [...table.domain];
    if (index < newDomain.length) {
      newDomain.splice(index, 1);
    }
    setTable({
      ...table,
      domain  : newDomain,
      columns : table.columns - 1,
      data    : newTable,
    });
  }

  function addColumn() {
    const newTable = table.data.map(r => [...r, '']);
    const newDomain = [...table.domain, ''];
    setTable({
      ...table,
      domain  : newDomain,
      columns : table.columns + 1,
      data    : newTable,
    });
  }

  const rows = [...table.data, []];

  return (
    <table>
      <tr>
        <td />
        {emptyRow.map(
          (_, index) =>
            table.columns > 1 && (
              <td key={index} style={{ textAlign : 'center' }}>
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
      {rows.map((row, index) =>
        index !== rows.length - 1 ? (
          <MMELTableRow
            key={index}
            row={row}
            line={index}
            setRow={row => setRow(index, row)}
            onDelete={() => onDeleteRow(index)}
          />
        ) : (
          <MMELTableRow key={index} row={emptyRow} setRow={newRow} />
        )
      )}
    </table>
  );
};

export default EditTableView;
