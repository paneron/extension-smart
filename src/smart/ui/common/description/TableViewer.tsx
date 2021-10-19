/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { HTMLTable, Text } from '@blueprintjs/core';
import { jsx } from '@emotion/react';
import { MMELTable } from '../../../serialize/interface/supportinterface';

const TableViewer: React.FC<{
  table: MMELTable;
}> = function ({ table }) {
  return (
    <HTMLTable
      style={{
        border: '2px solid black',
        borderCollapse: 'collapse',
        margin: '5px 5px 5px 5px',
      }}
    >
      {table.data.map((row, index) => (
        <RowViewer key={index} row={row} />
      ))}
    </HTMLTable>
  );
};

const RowViewer: React.FC<{
  row: string[];
}> = function ({ row }) {
  return (
    <tr>
      {row.map((x, index) => (
        <td
          key={index}
          style={{
            border: '1px solid black',
            borderCollapse: 'collapse',
          }}
        >
          <Text>{x}</Text>
        </td>
      ))}
    </tr>
  );
};

export default TableViewer;
