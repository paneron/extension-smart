/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { Button, Text } from '@blueprintjs/core';
import { Tooltip2 } from '@blueprintjs/popover2';
import { jsx } from '@emotion/react';
import { NormalTextField } from '../../common/fields';

const MMELTableRow: React.FC<{
  row: string[];
  line?: number;
  setRow: (r: string[]) => void;
  onDelete?: () => void;
}> = function ({ row, line, setRow, onDelete }) {
  function setValue(index: number, value: string) {
    const newRow = [...row];
    newRow[index] = value;
    setRow(newRow);
  }

  return (
    <tr>
      <td style={{ textAlign: 'right' }}>
        <Text>
          {line === undefined
            ? 'New row'
            : line === 0
            ? 'Header row'
            : `Row ${line}`}
        </Text>
      </td>
      {row.map((x, index) => (
        <td key={index}>
          <NormalTextField
            rows={1}
            value={x}
            onChange={x => setValue(index, x)}
          />
        </td>
      ))}
      <td>
        {onDelete !== undefined && (
          <Tooltip2 content="Remove row">
            <Button intent="danger" icon="cross" minimal onClick={onDelete} />
          </Tooltip2>
        )}
      </td>
    </tr>
  );
};

export default MMELTableRow;