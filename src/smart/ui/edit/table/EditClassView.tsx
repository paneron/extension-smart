import { Button, ButtonGroup, Dialog } from '@blueprintjs/core';
import React, { useState } from 'react';
import { useMemo } from 'react';
import { dialogLayout } from '../../../../css/layout';
import { DataType } from '../../../serialize/interface/baseinterface';
import { MMELTable } from '../../../serialize/interface/supportinterface';
import { IListItem } from '../../common/fields';
import ListWithPopoverItem from '../../common/listmanagement/listPopoverItem';
import ClassItemDisplayEdit from './ClassItemDisplayEdit';
import TableClassDefinitionEdit from './TableClassDefinitionEdit';
import TableClassItemEdit, { TableRowClass } from './TableClassItem';

type DialogType = 'class' | 'display';

const EditClassView: React.FC<{
  table: MMELTable;
  setTable: (x: MMELTable) => void;
}> = function (props) {
  const { table, setTable } = props;
  const [open, setOpen] = useState<DialogType | undefined>(undefined);
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
  const display: Record<string, string> = {};
  const header = table.data.length > 0 ? table.data[0] : [];
  for (const x of Object.values(data)) {
    if (table.classDisplay && table.classDisplay !== '') {
      let name = table.classDisplay;
      for (let i = 0; i < header.length && i < x.data.length; i++) {
        name = name.replaceAll(`[${header[i]}]`, x.data[i]);
      }
      display[x.id] = name;
    } else {
      display[x.id] = x.id;
    }
  }

  function onUpdate(data: string[][]) {
    const header = table.data.length > 0 ? table.data[0] : [];
    setTable({ ...table, data: [header, ...data] });
  }

  function getListItem(x: TableRowClass): IListItem {
    const name = display[x.id];
    return {
      id: x.id,
      text: name ?? x.id,
    };
  }

  function matchFilter(row: TableRowClass, filter: string): boolean {
    const name = display[row.id] ?? row.id;
    return filter === '' || name.toLowerCase().includes(filter);
  }

  return (
    <>
      <Dialog
        isOpen={open !== undefined}
        title="Table class definition"
        style={dialogLayout}
        onClose={() => setOpen(undefined)}
        canEscapeKeyClose={false}
        canOutsideClickClose={false}
      >
        {open === 'display' ? (
          <ClassItemDisplayEdit {...props} done={() => setOpen(undefined)} />
        ) : (
          <TableClassDefinitionEdit {...props} />
        )}
      </Dialog>
      <ButtonGroup>
        <Button onClick={() => setOpen('class')}>Edit Class definition</Button>
        <Button onClick={() => setOpen('display')}>Edit Item Display</Button>
      </ButtonGroup>
      <ListWithPopoverItem
        items={data}
        setItems={x => onUpdate(Object.values(x).map(y => y.data))}
        initObject={emptyRow}
        matchFilter={matchFilter}
        getListItem={getListItem}
        filterName="Data filter"
        table={table}
        Content={TableClassItemEdit}
        label="Class data"
        sort={
          table.classDisplay === undefined || table.classDisplay === ''
            ? 'number'
            : 'text'
        }
        requireUniqueId={false}
      />
    </>
  );
};

export default EditClassView;
