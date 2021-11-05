import { FormGroup } from '@blueprintjs/core';
import React from 'react';
import { MMELTable } from '../../../serialize/interface/supportinterface';
import { defaultItemSorter } from '../../../utils/ModelFunctions';
import {
  IListItem,
  IManageHandler,
  NormalTextField,
} from '../../common/fields';
import ListManagePage from '../../common/listmanagement/listmanagement';

type TableClassAttribute = {
  id: string;
  title: string;
  domain: string;
};

const initObj: TableClassAttribute = {
  id: '',
  title: '',
  domain: '',
};

const TableClassDefinitionEdit: React.FC<{
  table: MMELTable;
  setTable: (t: MMELTable) => void;
}> = function ({ table, setTable }) {
  const header = table.data.length > 0 ? table.data[0] : [];
  const domain = table.domain;
  while (header.length < table.columns) {
    header.push('');
  }
  while (domain.length < table.columns) {
    domain.push('');
  }
  const data: TableClassAttribute[] = header.map((x, index) => ({
    id: `${index}`,
    title: x,
    domain: domain[index],
  }));

  function matchFilter(x: TableClassAttribute, filter: string) {
    return filter === '' || x.title.toLowerCase().includes(filter);
  }

  function getAttListItems(filter: string): IListItem[] {
    return data
      .filter(x => matchFilter(x, filter))
      .map((x, index) => ({ id: `${index}`, text: x.title }))
      .sort(defaultItemSorter);
  }

  function removeAttListItem(ids: string[]) {
    const set = new Set(ids);
    const newData = [...table.data.slice(1)];
    for (let i = data.length - 1; i >= 0; i--) {
      if (set.has(data[i].title)) {
        data.splice(i, 1);
        newData.forEach(r => [...r].splice(i, 1));
      }
    }
    const newDomain = data.map(x => x.domain);
    const newRow = data.map(x => x.title);
    setTable({
      ...table,
      domain: newDomain,
      data: [newRow, ...newData],
      columns: newDomain.length,
    });
  }

  function addAtt(x: TableClassAttribute): boolean {
    const newData = [...table.data.slice(1)];
    newData.forEach(r => [...r, '']);
    const newDomain = [...data.map(x => x.domain), x.domain];
    const newRow = [...data.map(x => x.title), x.title];
    setTable({
      ...table,
      domain: newDomain,
      data: [newRow, ...newData],
      columns: newDomain.length,
    });
    return true;
  }

  function updateAtt(oldid: string, att: TableClassAttribute): boolean {
    for (let i = data.length - 1; i >= 0; i--) {
      if (data[i].id === oldid) {
        data[i] = att;
        const newDomain = data.map(x => x.domain);
        const newRow = data.map(x => x.title);
        const newData = [...table.data.slice(1)];
        setTable({
          ...table,
          domain: newDomain,
          data: [newRow, ...newData],
          columns: newDomain.length,
        });
        return true;
      }
    }
    return false;
  }

  function getAttById(id: string): TableClassAttribute {
    for (let i = data.length - 1; i >= 0; i--) {
      if (data[i].id === id) {
        return data[i];
      }
    }
    return { ...initObj };
  }

  const dchandler: IManageHandler<TableClassAttribute> = {
    filterName: 'Attribute filter',
    itemName: 'Class attributes',
    Content: TableClassItemPage,
    initObj: { ...initObj },
    getItems: getAttListItems,
    removeItems: removeAttListItem,
    addItem: obj => addAtt(obj),
    updateItem: (oldid, obj) => updateAtt(oldid, obj),
    getObjById: getAttById,
  };

  return <ListManagePage {...dchandler} />;
};

const TableClassItemPage: React.FC<{
  object: TableClassAttribute;
  setObject: (obj: TableClassAttribute) => void;
}> = ({ object: att, setObject: setAtt }) => {
  return (
    <FormGroup>
      <NormalTextField
        text="Title"
        value={att.title}
        onChange={x => setAtt({ ...att, title: x })}
      />
      <NormalTextField
        text="Possible values (separated by ,)"
        value={att.domain}
        onChange={x => setAtt({ ...att, domain: x })}
      />
    </FormGroup>
  );
};

export default TableClassDefinitionEdit;
