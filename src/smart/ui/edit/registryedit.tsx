import { FormGroup } from '@blueprintjs/core';
import React from 'react';
import type {
  EditorModel,
  EditorRegistry } from '@/smart/model/editormodel';
import {
  isEditorDataClass,
  isEditorRegistry,
} from '@/smart/model/editormodel';
import {
  checkId,
  defaultItemSorter,
  genDCIdByRegId,
} from '@/smart/utils/ModelFunctions';
import { createDataClass } from '@/smart/utils/EditorFactory';
import type { IListItem, IManageHandler } from '@/smart/ui/common/fields';
import { NormalTextField } from '@/smart/ui/common/fields';
import ListManagePage from '@/smart/ui/common/listmanagement/listmanagement';
import AttributeEditPage from '@/smart/ui/edit/attributeedit';
import type { ModelAction } from '@/smart/model/editor/model';
import type { RegistryCombined } from '@/smart/model/editor/components/element/registry';
import {
  addRegistryCommand,
  delRegistryCommand,
  editRegistryCommand,
} from '@/smart/model/editor/commands/data';

const initObj: RegistryCombined = { ...createDataClass(''), title : '' };

const RegistryEditPage: React.FC<{
  model: EditorModel;
  act: (x: ModelAction) => void;
}> = function ({ model, act }) {
  function matchFilter(reg: EditorRegistry, filter: string) {
    return (
      filter === '' ||
      reg.id.toLowerCase().includes(filter) ||
      reg.title.toLowerCase().includes(filter)
    );
  }

  function getRegListItems(filter: string): IListItem[] {
    return Object.values(model.elements)
      .filter(x => isEditorRegistry(x) && matchFilter(x, filter))
      .map(x => ({ id : x.id, text : (x as EditorRegistry).title }))
      .sort(defaultItemSorter);
  }

  function removeRegListItem(ids: string[]) {
    act(delRegistryCommand(ids));
  }

  function addRegistry(reg: RegistryCombined): boolean {
    const dcid = genDCIdByRegId(reg.id);
    if (
      checkId(reg.id, model.elements) &&
      checkId(dcid, model.elements, true)
    ) {
      act(addRegistryCommand(reg));
      return true;
    }
    return false;
  }

  function updateRegistry(oldid: string, reg: RegistryCombined): boolean {
    const dcid = genDCIdByRegId(reg.id);
    const old = model.elements[oldid];
    if (isEditorRegistry(old)) {
      if (
        oldid !== reg.id &&
        (!checkId(reg.id, model.elements) ||
          !checkId(dcid, model.elements, true))
      ) {
        return false;
      }
      act(editRegistryCommand(oldid, reg));
      return true;
    }
    return false;
  }

  function getRegById(id: string): RegistryCombined {
    const reg = model.elements[id];
    if (!isEditorRegistry(reg)) {
      return { ...initObj };
    }
    const dc = model.elements[reg.data];
    if (!isEditorDataClass(dc)) {
      return { ...initObj };
    }
    return { ...dc, id : id, title : reg.title };
  }

  const reghandler: IManageHandler<RegistryCombined> = {
    filterName  : 'Registry filter',
    itemName    : 'Data Registries',
    Content     : RegistryEditItemPage,
    initObj     : { ...initObj },
    model       : model,
    getItems    : getRegListItems,
    removeItems : removeRegListItem,
    addItem     : obj => addRegistry(obj),
    updateItem  : (oldid, obj) => updateRegistry(oldid, obj),
    getObjById  : getRegById,
  };

  return <ListManagePage {...reghandler} />;
};

const RegistryEditItemPage: React.FC<{
  object: RegistryCombined;
  model?: EditorModel;
  setObject: (obj: RegistryCombined) => void;
}> = ({ object: reg, model, setObject: setReg }) => {
  return (
    <FormGroup>
      <NormalTextField
        text="Registry ID"
        value={reg.id}
        onChange={x => setReg({ ...reg, id : x.replaceAll(/\s+/g, '') })}
      />
      <NormalTextField
        text="Registry title"
        value={reg.title}
        onChange={x => setReg({ ...reg, title : x })}
      />
      <AttributeEditPage
        attributes={{ ...reg.attributes }}
        model={model!}
        setAtts={x => setReg({ ...reg, attributes : x })}
      />
    </FormGroup>
  );
};

export default RegistryEditPage;
