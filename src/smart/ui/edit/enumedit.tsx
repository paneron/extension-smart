/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { jsx } from '@emotion/react';
import React from 'react';
import { EditorModel, isEditorDataClass } from '../../model/editormodel';
import { MMELObject } from '../../serialize/interface/baseinterface';
import { MMELEnum } from '../../serialize/interface/datainterface';
import { checkId, defaultItemSorter } from '../../utils/commonfunctions';
import { createEnum } from '../../utils/EditorFactory';
import { IListItem, IManageHandler, NormalTextField } from '../common/fields';
import ListManagePage from '../common/listmanagement/listmanagement';
import EnumValueEditPage from './enumvalueedit';

const initObj = createEnum('');

const EnumEditPage: React.FC<{
  model: EditorModel;
  setModel: (model: EditorModel) => void;
}> = function ({ model, setModel }) {
  function matchFilter(x: MMELEnum, filter: string) {
    return filter === '' || x.id.toLowerCase().indexOf(filter) !== -1;
  }

  function getEnumListItems(filter: string): IListItem[] {
    return Object.values(model.enums)
      .filter(x => matchFilter(x, filter))
      .map(x => ({ id: x.id, text: x.id }))
      .sort(defaultItemSorter);
  }

  function replaceReferences(matchid: string, replaceid: string) {
    for (const x in model.elements) {
      const elm = model.elements[x];
      if (isEditorDataClass(elm)) {
        for (const a in elm.attributes) {
          const att = elm.attributes[a];
          if (att.type === matchid) {
            att.type = replaceid;
          }
        }
      }
    }
  }

  function removeEnumListItem(ids: string[]) {
    for (const id of ids) {
      delete model.enums[id];
      replaceReferences(id, '');
    }
    setModel(model);
  }

  function addEnum(en: MMELEnum): boolean {
    if (checkId(en.id, model.enums)) {
      model.enums[en.id] = { ...en };
      setModel(model);
      return true;
    }
    return false;
  }

  function updateEnum(oldid: string, en: MMELEnum): boolean {
    if (oldid !== en.id) {
      if (checkId(en.id, model.enums)) {
        delete model.enums[oldid];
        model.enums[en.id] = { ...en };
        replaceReferences(oldid, en.id);
        setModel(model);
        return true;
      }
      return false;
    } else {
      model.enums[oldid] = { ...en };
      setModel(model);
      return true;
    }
  }

  function getEnumById(id: string): MMELEnum {
    const en = model.enums[id];
    if (en === undefined) {
      return initObj;
    }
    return en;
  }

  const refhandler: IManageHandler = {
    filterName: 'Enumeration filter',
    itemName: 'Enumerations',
    Content: EnumEditItemPage,
    initObj: initObj,
    model: model,
    getItems: getEnumListItems,
    removeItems: removeEnumListItem,
    addItem: obj => addEnum(obj as MMELEnum),
    updateItem: (oldid, obj) => updateEnum(oldid, obj as MMELEnum),
    getObjById: getEnumById,
  };

  return <ListManagePage {...refhandler} />;
};

const EnumEditItemPage: React.FC<{
  object: MMELObject;
  model: EditorModel;
  setObject: (obj: MMELObject) => void;
}> = ({ object, model, setObject }) => {
  const en = object as MMELEnum;
  return (
    <>
      <NormalTextField
        key="field#enumid"
        text="Enumeration ID"
        value={en.id}
        onChange={x => {
          en.id = x.replaceAll(/\s+/g, '');
          setObject({ ...en });
        }}
      />
      <EnumValueEditPage
        key={'ui#enum#enumValueEditPage'}
        values={{ ...en.values }}
        model={model}
        setValues={x => {
          en.values = x;
          setObject({ ...en });
        }}
      />
    </>
  );
};

export default EnumEditPage;
