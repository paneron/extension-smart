import { FormGroup } from '@blueprintjs/core';
import React from 'react';
import type { EditorModel } from '@/smart/model/editormodel';
import type { MMELEnum } from '@paneron/libmmel/interface/datainterface';
import { checkId, defaultItemSorter } from '@/smart/utils/ModelFunctions';
import { createEnum } from '@/smart/utils/EditorFactory';
import type { IListItem, IManageHandler } from '@/smart/ui/common/fields';
import { NormalTextField } from '@/smart/ui/common/fields';
import ListManagePage from '@/smart/ui/common/listmanagement/listmanagement';
import EnumValueEditPage from '@/smart/ui/edit/enumvalueedit';
import type { ModelAction } from '@/smart/model/editor/model';

const initObj = createEnum('');

const EnumEditPage: React.FC<{
  model: EditorModel;
  act: (x: ModelAction) => void;
}> = function ({ model, act }) {
  function matchFilter(x: MMELEnum, filter: string) {
    return filter === '' || x.id.toLowerCase().includes(filter);
  }

  function getEnumListItems(filter: string): IListItem[] {
    return Object.values(model.enums)
      .filter(x => matchFilter(x, filter))
      .map(x => ({ id : x.id, text : x.id }))
      .sort(defaultItemSorter);
  }

  function removeEnumListItem(ids: string[]) {
    const action: ModelAction = {
      type  : 'model',
      act   : 'enums',
      task  : 'delete',
      value : ids,
    };
    act(action);
  }

  function addEnum(en: MMELEnum): boolean {
    if (checkId(en.id, model.enums)) {
      const action: ModelAction = {
        type  : 'model',
        act   : 'enums',
        task  : 'add',
        value : [en],
      };
      act(action);
      return true;
    }
    return false;
  }

  function updateEnum(oldid: string, en: MMELEnum): boolean {
    if (oldid !== en.id && !checkId(en.id, model.enums)) {
      return false;
    }
    const action: ModelAction = {
      type  : 'model',
      act   : 'enums',
      task  : 'edit',
      id    : oldid,
      value : en,
    };
    act(action);
    return true;
  }

  function getEnumById(id: string): MMELEnum {
    const en = model.enums[id];
    if (en === undefined) {
      return initObj;
    }
    return en;
  }

  const refhandler: IManageHandler<MMELEnum> = {
    filterName  : 'Enumeration filter',
    itemName    : 'Enumerations',
    Content     : EnumEditItemPage,
    initObj     : initObj,
    model       : model,
    getItems    : getEnumListItems,
    removeItems : removeEnumListItem,
    addItem     : obj => addEnum(obj),
    updateItem  : (oldid, obj) => updateEnum(oldid, obj),
    getObjById  : getEnumById,
  };

  return <ListManagePage {...refhandler} />;
};

const EnumEditItemPage: React.FC<{
  object: MMELEnum;
  model?: EditorModel;
  setObject: (obj: MMELEnum) => void;
}> = ({ object: en, model, setObject: setEN }) => {
  return (
    <FormGroup>
      <NormalTextField
        text="Enumeration ID"
        value={en.id}
        onChange={x => setEN({ ...en, id : x.replaceAll(/\s+/g, '') })}
      />
      <EnumValueEditPage
        values={{ ...en.values }}
        model={model!}
        setValues={x => setEN({ ...en, values : x })}
      />
    </FormGroup>
  );
};

export default EnumEditPage;
