import React from 'react';
import { IEnum, IEnumValue } from '../../interface/datainterface';
import {
  IAddItem,
  IList,
  IListItem,
  IUpdateItem,
} from '../../interface/fieldinterface';
import NormalTextField from '../unit/textfield';

export class EnumValueHandler implements IList, IAddItem, IUpdateItem {
  filterName = 'Enumeration value filter';
  itemName = 'Enumeration values';
  private setAddMode: (b: boolean) => void;
  private updating: IEnumValue | null;
  private data: IEnumValue;
  private setData: (x: IEnumValue) => void;
  private forceUpdate: () => void;
  private setUpdateMode: (b: boolean) => void;
  private setUpdateAttribute: (x: IEnumValue) => void;
  private parent: IEnum;

  constructor(
    reg: IEnum,
    updateObj: IEnumValue | null,
    setAdd: (b: boolean) => void,
    setUpdate: (b: boolean) => void,
    setUpdateAttribute: (x: IEnumValue) => void,
    forceUpdate: () => void,
    data: IEnumValue,
    setAttribute: (x: IEnumValue) => void
  ) {
    this.updating = updateObj;
    this.parent = reg;
    this.setAddMode = setAdd;
    this.setUpdateMode = setUpdate;
    this.forceUpdate = forceUpdate;
    this.setUpdateAttribute = setUpdateAttribute;
    this.data = data;
    this.setData = setAttribute;
  }

  getItems = (): Array<EnumValueListItem> => {
    const out: Array<EnumValueListItem> = [];
    this.parent.values.forEach((r, index) => {
      out.push(new EnumValueListItem(r.id, r.value, '' + index));
    });
    return out;
  };

  addItemClicked = () => {
    this.data = { id: '', value: '' };
    this.setData({ ...this.data });
    this.setAddMode(true);
  };

  removeItem = (refs: Array<string>) => {
    for (let i = refs.length - 1; i >= 0; i--) {
      this.parent.values.splice(parseInt(refs[i]), 1);
    }
    this.forceUpdate();
  };

  updateItem = (ref: string) => {
    const x = parseInt(ref);
    if (!isNaN(x)) {
      const r = this.parent.values[x];
      this.data = { ...r };
      this.setData({ ...this.data });
      this.setUpdateAttribute(r);
      this.setUpdateMode(true);
    }
  };

  private getFields = (): Array<JSX.Element> => {
    const elms: Array<JSX.Element> = [];
    elms.push(
      <NormalTextField
        key="field#valueid"
        text="Enumeration item ID"
        value={this.data.id}
        update={(x: string) => {
          this.data.id = x.replaceAll(/\s+/g, '');
          this.setData({ ...this.data });
        }}
      />
    );
    elms.push(
      <NormalTextField
        key="field#valuecontent"
        text="Enumeration item value"
        value={this.data.value}
        update={(x: string) => {
          this.data.value = x;
          this.setData({ ...this.data });
        }}
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
    for (const a of this.parent.values) {
      if (a.id === this.data.id) {
        alert('ID already exists');
        return;
      }
    }
    this.parent.values.push(this.data);
    this.setAddMode(false);
  };

  addCancel = () => {
    this.data = { id: '', value: '' };
    this.setAddMode(false);
  };

  getUpdateFields = (): Array<JSX.Element> => {
    return this.getFields();
  };

  updateClicked = () => {
    this.setUpdateMode(false);
    if (this.updating !== null) {
      if (this.data.id !== this.updating.id) {
        if (this.data.id === '') {
          alert('New ID is empty');
          return;
        }
        for (const a of this.parent.values) {
          if (a.id === this.data.id) {
            alert('New ID already exists');
            return;
          }
        }
      }
      this.updating.id = this.data.id;
      this.updating.value = this.data.value;
      this.forceUpdate();
      this.setUpdateMode(false);
    }
  };

  updateCancel = () => {
    this.data = { id: '', value: '' };
    this.setUpdateMode(false);
  };
}

export class EnumValueListItem implements IListItem {
  id: string;
  text = '';
  reference: string;

  constructor(a: string, b: string, c: string) {
    this.id = a;
    this.text = b;
    this.reference = c;
  }
}
