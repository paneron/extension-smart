import React from 'react';
import { EditorModel } from '@/smart/model/editormodel';
import { MMELTable } from '@paneron/libmmel/interface/supportinterface';
import { checkId, defaultItemSorter } from '@/smart/utils/ModelFunctions';
import { createTable } from '@/smart/utils/EditorFactory';
import { IListItem, IManageHandler } from '@/smart/ui/common/fields';
import ListManagePage from '@/smart/ui/common/listmanagement/listmanagement';
import TableItemEditPage from '@/smart/ui/edit/table/TableItemEdit';
import { ModelAction } from '@/smart/model/editor/model';

const TableEditPage: React.FC<{
  model: EditorModel;
  act: (x: ModelAction) => void;
}> = function ({ model, act }) {
  function matchFilter(x: MMELTable, filter: string) {
    return (
      filter === '' ||
      x.id.toLowerCase().includes(filter) ||
      x.title.toLowerCase().includes(filter)
    );
  }

  function getTableListItems(filter: string): IListItem[] {
    return Object.values(model.tables)
      .filter(x => matchFilter(x, filter))
      .map(x => ({ id : x.id, text : x.title }))
      .sort(defaultItemSorter);
  }

  function removeTableListItem(ids: string[]) {
    const action: ModelAction = {
      type  : 'model',
      act   : 'table',
      task  : 'delete',
      value : ids,
    };
    act(action);
  }

  function addTable(x: MMELTable): boolean {
    if (checkId(x.id, model.tables)) {
      const action: ModelAction = {
        type  : 'model',
        act   : 'table',
        task  : 'add',
        value : [x],
      };
      act(action);
      return true;
    }
    return false;
  }

  function updateTable(oldid: string, x: MMELTable): boolean {
    if (oldid !== x.id && !checkId(x.id, model.tables)) {
      return false;
    }
    const action: ModelAction = {
      type  : 'model',
      act   : 'table',
      task  : 'edit',
      id    : oldid,
      value : x,
    };
    act(action);
    return true;
  }

  function getTableById(id: string): MMELTable {
    const table = model.tables[id];
    if (table === undefined) {
      return createTable('');
    }
    return table;
  }

  const tablehandler: IManageHandler<MMELTable> = {
    filterName  : 'Table filter',
    itemName    : 'View tables',
    Content     : TableItemEditPage,
    initObj     : createTable(''),
    model       : model,
    getItems    : getTableListItems,
    removeItems : removeTableListItem,
    addItem     : obj => addTable(obj),
    updateItem  : (oldid, obj) => updateTable(oldid, obj),
    getObjById  : getTableById,
  };

  return <ListManagePage {...tablehandler} />;
};

export default TableEditPage;
