import { FormGroup } from '@blueprintjs/core';
import React from 'react';
import type {
  EditorDataClass,
  EditorModel } from '@/smart/model/editormodel';
import {
  isEditorDataClass,
} from '@/smart/model/editormodel';
import { checkId, defaultItemSorter } from '@/smart/utils/ModelFunctions';
import { createDataClass } from '@/smart/utils/EditorFactory';
import type { IListItem, IManageHandler } from '@/smart/ui/common/fields';
import { NormalTextField } from '@/smart/ui/common/fields';
import ListManagePage from '@/smart/ui/common/listmanagement/listmanagement';
import AttributeEditPage from '@/smart/ui/edit/attributeedit';
import type { ModelAction } from '@/smart/model/editor/model';
import {
  addDCCommand,
  delDCCommand,
  editDCCommand,
} from '@/smart/model/editor/commands/data';

const initObj = createDataClass('');

const DataClassEditPage: React.FC<{
  model: EditorModel;
  act: (x: ModelAction) => void;
}> = function ({ model, act }) {
  function matchFilter(x: EditorDataClass, filter: string) {
    return filter === '' || x.id.toLowerCase().includes(filter);
  }

  function getDCListItems(filter: string): IListItem[] {
    return Object.values(model.elements)
      .filter(
        x => isEditorDataClass(x) && x.mother === '' && matchFilter(x, filter)
      )
      .map(x => ({ id : x.id, text : x.id }))
      .sort(defaultItemSorter);
  }

  function removeDCListItem(ids: string[]) {
    act(delDCCommand(ids));
  }

  function addDC(dc: EditorDataClass): boolean {
    if (checkId(dc.id, model.elements)) {
      act(addDCCommand(dc));
      return true;
    }
    return false;
  }

  function updateDC(oldid: string, dc: EditorDataClass): boolean {
    if (oldid !== dc.id && !checkId(dc.id, model.elements)) {
      return false;
    }
    act(editDCCommand(oldid, dc));
    return true;
  }

  function getDCById(id: string): EditorDataClass {
    const dc = model.elements[id];
    if (isEditorDataClass(dc)) {
      return dc;
    }
    return { ...initObj };
  }

  const dchandler: IManageHandler<EditorDataClass> = {
    filterName  : 'Data structure filter',
    itemName    : 'Data Structures',
    Content     : DataClassItemPage,
    initObj     : { ...initObj },
    model       : model,
    getItems    : getDCListItems,
    removeItems : removeDCListItem,
    addItem     : obj => addDC(obj),
    updateItem  : (oldid, obj) => updateDC(oldid, obj),
    getObjById  : getDCById,
  };

  return <ListManagePage {...dchandler} />;
};

const DataClassItemPage: React.FC<{
  object: EditorDataClass;
  model?: EditorModel;
  setObject: (obj: EditorDataClass) => void;
  oldid: string;
}> = ({ object: dc, model, setObject: setDC, oldid }) => {
  return (
    <FormGroup>
      <NormalTextField
        text="Dataclass ID"
        value={dc.id}
        onChange={x => setDC({ ...dc, id : x.replaceAll(/\s+/g, '') })}
      />
      <AttributeEditPage
        attributes={{ ...dc.attributes }}
        model={model!}
        setAtts={x => setDC({ ...dc, attributes : x })}
        oldid={oldid}
      />
    </FormGroup>
  );
};

export default DataClassEditPage;
