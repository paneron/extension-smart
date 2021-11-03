import { Button, Dialog } from '@blueprintjs/core';
import React, { useState } from 'react';
import { useMemo } from 'react';
import { dialogLayout } from '../../../../css/layout';
import { DataType } from '../../../serialize/interface/baseinterface';
import { MMELTable } from '../../../serialize/interface/supportinterface';
import ListWithPopoverItem from '../../common/listmanagement/listPopoverItem';
import TableClassDefinitionEdit from './TableClassDefinitionEdit';
import TableClassItemEdit, { TableRowClass } from './TableClassItem';

const EditClassView: React.FC<{
  table: MMELTable;
  setTable: (x: MMELTable) => void;
}> = function (props) {
  const { table, setTable } = props;
  const [open, setOpen] = useState<boolean>(false);
  const emptyRow: TableRowClass = useMemo(
    () => ({
      id: '',
      datatype: DataType.TABLE,
      data: new Array(table.columns).fill(''),
    }),
    [table.columns]
  );

  const data: Record<string, TableRowClass> = table.data
    .slice(1)
    .reduce<Record<string, TableRowClass>>(
      (obj, x, index) => ({
        ...obj,
        [index]: {
          id: `${index}`,
          datatype: 'table',
          data: x,
        },
      }),
      {}
    );

  function onUpdate(data: string[][]) {
    const header = table.data.length > 0 ? table.data[0] : [];
    setTable({ ...table, data: [header, ...data] });
  }

  return (
    <>
      <Dialog
        isOpen={open}
        title="Table class definition"
        style={dialogLayout}
        onClose={() => setOpen(false)}
        canEscapeKeyClose={false}
        canOutsideClickClose={false}
      >
        <TableClassDefinitionEdit {...props} />
      </Dialog>
      <Button onClick={() => setOpen(true)}>Edit Class definition</Button>
      <ListWithPopoverItem
        items={data}
        setItems={x => onUpdate(Object.values(x).map(y => y.data))}
        initObject={emptyRow}
        matchFilter={matchFilter}
        filterName="Data filter"
        table={table}
        Content={TableClassItemEdit}
        label="Class data"
        sortAsNum
        requireUniqueId={false}
      />
    </>
  );
};

function matchFilter(row: TableRowClass, filter: string): boolean {
  return filter === '' || row.id.toLowerCase().includes(filter);
}

export default EditClassView;
