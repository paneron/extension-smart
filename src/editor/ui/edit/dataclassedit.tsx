/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { jsx } from '@emotion/react';
import React from 'react';
import {
  EditorDataClass,
  EditorModel,
  isEditorDataClass,
} from '../../model/editormodel';
import { MMELObject } from '../../serialize/interface/baseinterface';
import { checkId, fillRDCS } from '../../utils/commonfunctions';
import { createDataClass } from '../../utils/EditorFactory';
import { IListItem, IManageHandler, NormalTextField } from '../common/fields';
import ListManagePage from '../common/listmanagement/listmanagement';
import AttributeEditPage from './attributeedit';

const initObj = createDataClass('');

const DataClassEditPage: React.FC<{
  model: EditorModel;
  setModel: (model: EditorModel) => void;
}> = function ({ model, setModel }) {
  function matchFilter(x: EditorDataClass, filter: string) {
    return filter === '' || x.id.toLowerCase().indexOf(filter) !== -1;
  }

  function getDCListItems(filter: string): IListItem[] {
    return Object.values(model.elements)
      .filter(
        x => isEditorDataClass(x) && x.mother === null && matchFilter(x, filter)
      )
      .map(x => ({ id: x.id, text: x.id }))
      .sort((a, b) => a.id.localeCompare(b.id));
  }

  function replaceReferences(
    matchid: string,
    replaceid: string,
    newdc: EditorDataClass | null
  ) {
    for (const x in model.elements) {
      const elm = model.elements[x];
      if (isEditorDataClass(elm)) {
        for (const dc of elm.rdcs) {
          if (dc.id === matchid) {
            elm.rdcs.delete(dc);
            if (newdc !== null) {
              elm.rdcs.add(newdc);
            }
          }
        }
        for (const a in elm.attributes) {
          const att = elm.attributes[a];
          if (att.type === matchid) {
            att.type = replaceid;
          }
        }
      }
    }
    for (const p in model.pages) {
      const page = model.pages[p];
      const data = page.data[matchid];
      if (data !== undefined) {
        delete page.data[matchid];
        if (replaceid !== '') {
          data.element = replaceid;
          page.data[replaceid] = data;
        }
      }
    }
  }

  function removeDCListItem(ids: string[]) {
    for (const id of ids) {
      const dc = model.elements[id];
      if (isEditorDataClass(dc)) {
        delete model.elements[id];
        replaceReferences(id, '', null);
      }
    }
    setModel(model);
  }

  function addDC(dc: EditorDataClass): boolean {
    if (checkId(dc.id, model.elements)) {
      const newdc = { ...dc };
      model.elements[dc.id] = newdc;
      fillRDCS(newdc, model.elements);
      setModel({ ...model });
      return true;
    }
    return false;
  }

  function updateDC(oldid: string, dc: EditorDataClass): boolean {
    if (oldid !== dc.id) {
      if (checkId(dc.id, model.elements)) {
        delete model.elements[oldid];
        const newdc = { ...dc };
        model.elements[dc.id] = newdc;
        replaceReferences(oldid, dc.id, newdc);
        fillRDCS(newdc, model.elements);
        setModel(model);
        return true;
      }
      return false;
    } else {
      const newdc = { ...dc };
      model.elements[oldid] = newdc;
      fillRDCS(dc, model.elements);
      setModel(model);
      return true;
    }
  }

  function getDCById(id: string): EditorDataClass {
    const dc = model.elements[id];
    if (isEditorDataClass(dc)) {
      return dc;
    }
    return { ...initObj };
  }

  const dchandler: IManageHandler = {
    filterName: 'Data structure filter',
    itemName: 'Data Structures',
    Content: DataClassItemPage,
    initObj: { ...initObj },
    model: model,
    getItems: getDCListItems,
    removeItems: removeDCListItem,
    addItem: obj => addDC(obj as EditorDataClass),
    updateItem: (oldid, obj) => updateDC(oldid, obj as EditorDataClass),
    getObjById: getDCById,
  };

  return <ListManagePage {...dchandler} />;
};

const DataClassItemPage: React.FC<{
  object: MMELObject;
  model: EditorModel;
  setObject: (obj: MMELObject) => void;
}> = ({ object, model, setObject }) => {
  const dc = object as EditorDataClass;
  return (
    <>
      <NormalTextField
        key="field#dataclassid"
        text="Dataclass ID"
        value={dc.id}
        onChange={x => {
          dc.id = x.replaceAll(/\s+/g, '');
          setObject({ ...dc });
        }}
      />
      <AttributeEditPage
        key={'ui#dataclass#attributeEditPage'}
        attributes={{ ...dc.attributes }}
        model={model}
        setAtts={x => {
          dc.attributes = x;
          setObject({ ...dc });
        }}
      />
    </>
  );
};

export default DataClassEditPage;
