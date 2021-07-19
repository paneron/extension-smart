import React from 'react';
import { MMELFactory } from '../../../runtime/modelComponentCreator';
import { MMELEnum } from '../../../serialize/interface/datainterface';
import { IEnum, IEnumValue } from '../../interface/datainterface';
import {
  IAddItem,
  IList,
  IListItem,
  IUpdateItem,
} from '../../interface/fieldinterface';
import { ModelWrapper } from '../../model/modelwrapper';
import EnumValueEditPage from '../edit/enumvalueedit';
import NormalTextField from '../unit/textfield';

export class EnumHandler implements IList, IAddItem, IUpdateItem {
  filterName = 'Enumeration filter';
  itemName = 'Enumerations';
  private mw: ModelWrapper;
  private setAddMode: (b: boolean) => void;
  private updating: MMELEnum | null;
  private data: IEnum;
  private setData: (x: IEnum) => void;
  private forceUpdate: () => void;
  private setUpdateMode: (b: boolean) => void;
  private setUpdateEnum: (x: MMELEnum) => void;

  constructor(
    mw: ModelWrapper,
    updateObj: MMELEnum | null,
    setAdd: (b: boolean) => void,
    setUpdate: (b: boolean) => void,
    setUpdateEnum: (x: MMELEnum) => void,
    forceUpdate: () => void,
    data: IEnum,
    setEnum: (x: IEnum) => void
  ) {
    this.mw = mw;
    this.updating = updateObj;
    this.setAddMode = setAdd;
    this.setUpdateMode = setUpdate;
    this.forceUpdate = forceUpdate;
    this.setUpdateEnum = setUpdateEnum;
    this.data = data;
    this.setData = setEnum;
  }

  getItems = (): Array<EnumListItem> => {
    const out: Array<EnumListItem> = [];
    this.mw.model.enums.forEach((e, index) => {
      out.push(new EnumListItem(e.id, e.id, '' + index));
    });
    return out;
  };

  addItemClicked = () => {
    this.data.id = '';
    this.data.values = [];
    this.setData({ ...this.data });
    this.setAddMode(true);
  };

  removeItem = (refs: Array<string>) => {
    for (let i = refs.length - 1; i >= 0; i--) {
      const removed = this.mw.model.enums.splice(parseInt(refs[i]), 1);
      if (removed.length > 0) {
        const r = removed[0];
        this.mw.idman.enums.delete(r.id);
        for (const dc of this.mw.model.dataclasses) {
          for (const a of dc.attributes) {
            if (a.type === r.id) {
              a.type = '';
            }
          }
        }
      }
    }
    this.forceUpdate();
  };

  updateItem = (ref: string) => {
    const x = parseInt(ref);
    if (!isNaN(x)) {
      const e = this.mw.model.enums[x];
      this.data.id = e.id;
      this.data.values = [];
      e.values.map(v => {
        const x: IEnumValue = { id: v.id, value: v.value };
        this.data.values.push(x);
      });
      this.setData({ ...this.data });
      this.setUpdateEnum(e);
      this.setUpdateMode(true);
    }
  };

  private getFields = (): Array<JSX.Element> => {
    const elms: Array<JSX.Element> = [];
    elms.push(
      <NormalTextField
        key="field#enumid"
        text="Enumeration ID"
        value={this.data.id}
        update={(x: string) => {
          this.data.id = x.replaceAll(/\s+/g, '');
          this.setData({ ...this.data });
        }}
      />
    );
    elms.push(
      <EnumValueEditPage
        key={'ui#enum#enumValueEditPage'}
        en={this.data}
        setEnum={this.setData}
      />
    );
    return elms;
  };

  getAddFields = (): Array<JSX.Element> => {
    return this.getFields();
  };

  addClicked = () => {
    if (this.data.id === '') {
      alert('ID is empty');
      return;
    }
    const model = this.mw.model;
    const idreg = this.mw.idman;
    if (idreg.enums.has(this.data.id)) {
      alert('ID already exists');
    } else {
      // add Enum
      const nr = MMELFactory.createEnum(this.data.id);
      for (const a of this.data.values) {
        const na = MMELFactory.createEnumValue(a.id);
        na.value = a.value;
        nr.values.push(na);
      }
      idreg.enums.set(nr.id, nr);
      model.enums.push(nr);
      this.setAddMode(false);
    }
  };

  addCancel = () => {
    this.data.id = '';
    this.data.values = [];
    this.setAddMode(false);
  };

  getUpdateFields = (): Array<JSX.Element> => {
    return this.getFields();
  };

  updateClicked = () => {
    if (this.updating !== null) {
      const idreg = this.mw.idman;
      const old = this.updating;
      if (this.data.id !== old.id) {
        if (this.data.id === '') {
          alert('New ID is empty');
          return;
        }
        if (idreg.enums.has(this.data.id)) {
          alert('New ID already exists');
          return;
        }
      }
      // update enum
      for (const x of this.mw.model.dataclasses) {
        for (const a of x.attributes) {
          if (a.type === old.id) {
            a.type = this.data.id;
          }
        }
      }
      idreg.enums.delete(old.id);
      old.id = this.data.id;
      idreg.enums.set(old.id, old);
      old.values = [];
      for (const a of this.data.values) {
        const na = MMELFactory.createEnumValue(a.id);
        na.value = a.value;
        old.values.push(na);
      }
      this.setUpdateMode(false);
    }
  };

  updateCancel = () => {
    this.data.id = '';
    this.data.values = [];
    this.setUpdateMode(false);
  };
}

export class EnumListItem implements IListItem {
  id: string;
  text = '';
  reference: string;

  constructor(a: string, b: string, c: string) {
    this.id = a;
    this.text = b;
    this.reference = c;
  }
}
