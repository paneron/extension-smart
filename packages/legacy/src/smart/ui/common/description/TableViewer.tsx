import { HTMLTable, Text } from '@blueprintjs/core';
import React from 'react';
import { MMELTable } from '../../../serialize/interface/supportinterface';
import { DescriptionItem } from './fields';

const TableViewer: React.FC<{
  table: MMELTable;
}> = function ({ table }) {
  return (
    <>
      <DescriptionItem label="Title" value={table.title} />
      <HTMLTable
        style={{
          border         : '2px solid black',
          borderCollapse : 'collapse',
          margin         : '5px 5px 5px 5px',
        }}
      >
        {table.data.map((row, index) => (
          <RowViewer key={index} row={row} />
        ))}
      </HTMLTable>
    </>
  );
};

type CellInfo = {
  data: string;
  span: number;
};

const RowViewer: React.FC<{
  row: string[];
}> = function ({ row }) {
  const filteredRows: CellInfo[] = [];
  for (const x of row) {
    if (x !== '' || filteredRows.length === 0) {
      filteredRows.push({ data : x, span : 1 });
    } else {
      filteredRows[filteredRows.length - 1].span++;
    }
  }

  return (
    <tr>
      {filteredRows.map((x, index) => (
        <td
          colSpan={x.span}
          key={index}
          style={{
            border         : '1px solid black',
            borderCollapse : 'collapse',
          }}
        >
          <Text>{x.data}</Text>
        </td>
      ))}
    </tr>
  );
};

export default TableViewer;
