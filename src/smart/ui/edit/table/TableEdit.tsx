import React from 'react';
import {
  EditorModel,
  EditorProcess,
  isEditorProcess,
} from '../../../model/editormodel';
import { MMELTable } from '../../../serialize/interface/supportinterface';
import { checkId, defaultItemSorter } from '../../../utils/ModelFunctions';
import { createTable } from '../../../utils/EditorFactory';
import { IListItem, IManageHandler } from '../../common/fields';
import ListManagePage from '../../common/listmanagement/listmanagement';
import TableItemEditPage from './TableItemEdit';

const TableEditPage: React.FC<{
  model: EditorModel;
  setModel: (model: EditorModel) => void;
}> = function ({ model, setModel }) {
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
      .map(x => ({ id: x.id, text: x.title }))
      .sort(defaultItemSorter);
  }

  function replaceReferences(matchid: string, replaceid: string) {
    for (const x in model.elements) {
      const elm = model.elements[x];
      if (isEditorProcess(elm)) {
        const newSet = new Set([...elm.tables]);
        if (newSet.has(matchid)) {
          newSet.delete(matchid);
          newSet.add(replaceid);
          const newElm: EditorProcess = { ...elm, tables: newSet };
          model.elements[x] = newElm;
        }
      }
    }
  }

  function removeTableListItem(ids: string[]) {
    for (const id of ids) {
      delete model.tables[id];
    }
    setModel(model);
  }

  function addTable(x: MMELTable): boolean {
    if (checkId(x.id, model.tables)) {
      model.tables[x.id] = { ...x };
      setModel(model);
      return true;
    }
    return false;
  }

  function updateTable(oldid: string, x: MMELTable): boolean {
    if (oldid !== x.id) {
      if (checkId(x.id, model.tables)) {
        delete model.tables[oldid];
        model.tables[x.id] = { ...x };
        replaceReferences(oldid, x.id);
        setModel(model);
        return true;
      }
      return false;
    } else {
      model.tables[oldid] = { ...x };
      setModel(model);
      return true;
    }
  }

  function getTableById(id: string): MMELTable {
    const table = model.tables[id];
    if (table === undefined) {
      return createTable('');
    }
    return table;
  }

  const tablehandler: IManageHandler<MMELTable> = {
    filterName: 'Table filter',
    itemName: 'View tables',
    Content: TableItemEditPage,
    initObj: createTable(''),
    model: model,
    getItems: getTableListItems,
    removeItems: removeTableListItem,
    addItem: obj => addTable(obj),
    updateItem: (oldid, obj) => updateTable(oldid, obj),
    getObjById: getTableById,
  };

  return <ListManagePage {...tablehandler} />;
};

export default TableEditPage;
