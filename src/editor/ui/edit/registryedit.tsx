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
  genDCIdByRegId,
  getReferenceDCTypeName,
  replaceSet,
} from '../../utils/commonfunctions';
import { createDataClass, createRegistry } from '../../utils/EditorFactory';
import { IListItem, IManageHandler, NormalTextField } from '../common/fields';
import ListManagePage from '../common/listmanagement/listmanagement';

type RegistryCombined = EditorDataClass & {
  title: string;
};

const RegistryEditPage: React.FC<{
  model: EditorModel;
  setModel: (model: EditorModel) => void;
}> = function ({ model, setModel }) {
  const newdc = createDataClass('');
  const initObj: RegistryCombined = { ...newdc, title: '' };

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
    return out;
  }

  function replaceReferences(
    matchregid: string,
    matchdcid: string,
    replaceid: string,
    newdcid: string
  ) {
    for (const x in model.elements) {
      const elm = model.elements[x];
      if (isEditorProcess(elm)) {
        replaceSet(elm.input, matchregid, replaceid);
        replaceSet(elm.output, matchregid, replaceid);
      } else if (isEditorAppproval(elm)) {
        replaceSet(elm.records, matchregid, replaceid);
      } else if (replaceid === '' && isEditorDataClass(elm)) {
        for (const dc of elm.rdcs) {
          if (dc.id === matchdcid) {
            elm.rdcs.delete(dc);
          }
        }
        for (const a in elm.attributes) {
          const att = elm.attributes[a];
          if (att.type === matchdcid) {
            att.type = newdcid;
          } else {
            if (att.type === getReferenceDCTypeName(matchdcid)) {
              att.type = getReferenceDCTypeName(newdcid);
            }
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
        replaceReferences(id, reg.data, '', '');
      }
    }
    setModel(model);
  }

  function checkId(id: string, dcid: string): boolean {
    if (id === '') {
      alert('New ID is empty');
      return false;
    }
    if (
      model.elements[id] !== undefined ||
      model.elements[dcid] !== undefined
    ) {
      alert('New ID already exists');
      return false;
    }
    return true;
  }

  function addRegistry(reg: RegistryCombined): boolean {
    const dcid = genDCIdByRegId(reg.id);
    if (checkId(reg.id, dcid)) {
      const newreg = createRegistry(reg.id);
      const newdc = reg as EditorDataClass;
      newreg.data = dcid;
      newreg.title = reg.title;
      model.elements[reg.id] = newreg;
      model.elements[dcid] = newdc;
      return true;
    }
    return false;
  }

  function updateRegistry(oldid: string, reg: RegistryCombined): boolean {
    const dcid = genDCIdByRegId(reg.id);
    const old = model.elements[oldid];
    if (isEditorRegistry(old)) {
      if (oldid !== reg.id) {
        if (checkId(reg.id, dcid)) {
          delete model.elements[oldid];
          delete model.elements[old.data];
          replaceReferences(oldid, old.data, reg.id, dcid);
          // examine
          return true;
        }
        return false;
      } else {
        old.title = reg.title;
        model.elements[oldid] = old;
        // examine
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
    return { ...dc, title: reg.title };
  }

  const rolehandler: IManageHandler = {
    filterName: 'Registry filter',
    itemName: 'Data Registries',
    Content: RegistryEditItemPage,
    initObj: { ...initObj },
    getItems: getRegListItems,
    removeItems: removeRegListItem,
    addItem: obj => addRegistry(obj as RegistryCombined),
    updateItem: (oldid, obj) => updateRegistry(oldid, obj as RegistryCombined),
    getObjById: getRegById,
  };

  return <ListManagePage {...rolehandler} />;
};

const RegistryEditItemPage: React.FC<{
  object: MMELObject;
  setObject: (obj: MMELObject) => void;
}> = ({ object, setObject }) => {
  const reg = object as RegistryCombined;
  return (
    <>
      <NormalTextField
        key="field#registryid"
        text="Registry ID"
        value={reg.id}
        update={(x: string) => {
          reg.id = x.replaceAll(/\s+/g, '');
          setObject({ ...reg });
        }}
      />
      <NormalTextField
        key="field#regtitle"
        text="Registry title"
        value={reg.title}
        update={(x: string) => {
          reg.title = x;
          setObject({ ...reg });
        }}
      />
      {/* <AttributeEditPage
        key={'ui#registry#attributeEditPage'}
        model={this.mw.model}
        atts={this.data}
        setAtts={x =>
          this.setData({
            ...x,
            regid: this.data.regid,
            regtitle: this.data.regtitle,
          })
          setObject({...reg })
        }
      /> */}
    </>
  );
};

export default RegistryEditPage;
