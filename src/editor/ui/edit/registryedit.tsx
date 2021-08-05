/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { jsx } from '@emotion/react';
import React from 'react';
import {
  EditorDataClass,
  EditorModel,
  isEditorAppproval,
  isEditorDataClass,
  isEditorProcess,
  isEditorRegistry,
} from '../../model/editormodel';
import { MMELObject } from '../../serialize/interface/baseinterface';
import {
  checkId,
  fillRDCS,
  genDCIdByRegId,
  getReferenceDCTypeName,
  replaceSet,
} from '../../utils/commonfunctions';
import { createDataClass, createRegistry } from '../../utils/EditorFactory';
import { IListItem, IManageHandler, NormalTextField } from '../common/fields';
import ListManagePage from '../common/listmanagement/listmanagement';
import AttributeEditPage from './attributeedit';

type RegistryCombined = EditorDataClass & {
  title: string;
};

const initObj: RegistryCombined = { ...createDataClass(''), title: '' };

const RegistryEditPage: React.FC<{
  model: EditorModel;
  setModel: (model: EditorModel) => void;
}> = function ({ model, setModel }) {
  function getRegListItems(filter: string): IListItem[] {
    const smallfilter = filter.toLowerCase();
    const out: IListItem[] = [];
    for (const r in model.elements) {
      const reg = model.elements[r];
      if (isEditorRegistry(reg)) {
        if (
          smallfilter === '' ||
          reg.id.toLowerCase().indexOf(smallfilter) !== -1 ||
          reg.title.toLowerCase().indexOf(smallfilter) !== -1
        ) {
          out.push({
            id: reg.id,
            text: reg.title,
          });
        }
      }
    }
    out.sort((a, b) => a.id.localeCompare(b.id));
    return out;
  }

  function replaceReferences(
    matchregid: string,
    matchdcid: string,
    replaceid: string,
    newdcid: string,
    newdc: EditorDataClass | null
  ) {
    const oldrefdcid = getReferenceDCTypeName(matchdcid);
    const newrefdcid = getReferenceDCTypeName(newdcid);
    for (const x in model.elements) {
      const elm = model.elements[x];
      if (isEditorProcess(elm)) {
        replaceSet(elm.input, matchregid, replaceid);
        replaceSet(elm.output, matchregid, replaceid);
      } else if (isEditorAppproval(elm)) {
        replaceSet(elm.records, matchregid, replaceid);
      } else if (isEditorDataClass(elm)) {
        for (const dc of elm.rdcs) {
          if (dc.id === matchdcid) {
            elm.rdcs.delete(dc);
            if (newdc !== null) {
              elm.rdcs.add(newdc);
            }
          }
        }
        for (const a in elm.attributes) {
          const att = elm.attributes[a];
          if (att.type === matchdcid) {
            att.type = newdcid;
          } else if (att.type === oldrefdcid) {
            att.type = newrefdcid;
          }
        }
      }
    }
    for (const p in model.pages) {
      const page = model.pages[p];
      const data = page.data[matchregid];
      if (data !== undefined) {
        delete page.data[matchregid];
        if (replaceid !== '') {
          data.element = replaceid;
          page.data[replaceid] = data;
        }
      }
    }
  }

  function removeRegListItem(ids: string[]) {
    for (const id of ids) {
      const reg = model.elements[id];
      if (isEditorRegistry(reg)) {
        delete model.elements[id];
        delete model.elements[reg.data];
        replaceReferences(id, reg.data, '', '', null);
      }
    }
    setModel(model);
  }

  function addRegistry(reg: RegistryCombined): boolean {
    const dcid = genDCIdByRegId(reg.id);
    if (checkId(reg.id, model.elements) && checkId(dcid, model.elements)) {
      const newreg = createRegistry(reg.id);
      const newdc = { ...reg } as EditorDataClass;
      newdc.id = dcid;
      newdc.mother = newreg;
      newreg.data = dcid;
      newreg.title = reg.title;
      model.elements[reg.id] = newreg;
      model.elements[dcid] = newdc;
      fillRDCS(newdc, model.elements);
      setModel(model);
      return true;
    }
    return false;
  }

  function updateRegistry(oldid: string, reg: RegistryCombined): boolean {
    const dcid = genDCIdByRegId(reg.id);
    const old = model.elements[oldid];
    if (isEditorRegistry(old)) {
      if (oldid !== reg.id) {
        if (checkId(reg.id, model.elements) && checkId(dcid, model.elements)) {
          delete model.elements[oldid];
          delete model.elements[old.data];
          const newreg = createRegistry(reg.id);
          const newdc = { ...reg } as EditorDataClass;
          newdc.id = dcid;
          newdc.mother = newreg;
          newreg.data = dcid;
          newreg.title = reg.title;
          model.elements[reg.id] = newreg;
          model.elements[dcid] = newdc;
          fillRDCS(newdc, model.elements);
          replaceReferences(oldid, old.data, reg.id, dcid, newdc);
          setModel(model);
          return true;
        }
        return false;
      } else {
        old.title = reg.title;
        model.elements[oldid] = old;
        const dc = reg as EditorDataClass;
        model.elements[old.data] = dc;
        fillRDCS(dc, model.elements);
        setModel(model);
        return true;
      }
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
    return { ...dc, id: id, title: reg.title };
  }

  const reghandler: IManageHandler = {
    filterName: 'Registry filter',
    itemName: 'Data Registries',
    Content: RegistryEditItemPage,
    initObj: { ...initObj },
    model: model,
    getItems: getRegListItems,
    removeItems: removeRegListItem,
    addItem: obj => addRegistry(obj as RegistryCombined),
    updateItem: (oldid, obj) => updateRegistry(oldid, obj as RegistryCombined),
    getObjById: getRegById,
  };

  return <ListManagePage {...reghandler} />;
};

const RegistryEditItemPage: React.FC<{
  object: MMELObject;
  model: EditorModel;
  setObject: (obj: MMELObject) => void;
}> = ({ object, model, setObject }) => {
  const reg = object as RegistryCombined;
  return (
    <>
      <NormalTextField
        key="field#registryid"
        text="Registry ID"
        value={reg.id}
        onChange={(x: string) => {
          reg.id = x.replaceAll(/\s+/g, '');
          setObject({ ...reg });
        }}
      />
      <NormalTextField
        key="field#regtitle"
        text="Registry title"
        value={reg.title}
        onChange={(x: string) => {
          reg.title = x;
          setObject({ ...reg });
        }}
      />
      <AttributeEditPage
        key={'ui#registry#attributeEditPage'}
        attributes={{ ...reg.attributes }}
        model={model}
        setAtts={x => {
          reg.attributes = x;
          setObject({ ...reg });
        }}
      />
    </>
  );
};

export default RegistryEditPage;
