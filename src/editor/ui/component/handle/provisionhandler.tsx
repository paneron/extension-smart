import React from 'react';
import { MODAILITYOPTIONS } from '../../../runtime/idManager';
import { MMELModel } from '../../../serialize/interface/model';
import { IProcess, IProvision } from '../../interface/datainterface';
import {
  IAddItem,
  IList,
  IListItem,
  IUpdateItem,
} from '../../interface/fieldinterface';
import NormalComboBox from '../unit/combobox';
import { MultiReferenceSelector } from '../unit/referenceselect';
import NormalTextField from '../unit/textfield';

export class ProvisionHandler implements IList, IAddItem, IUpdateItem {
  filterName = 'Provision filter';
  itemName = 'Provision';
  private model: MMELModel;
  private setAddMode: (b: boolean) => void;
  private oldValue: IProvision | null;
  private data: IProvision;
  private setData: (x: IProvision) => void;
  private forceUpdate: () => void;
  private setUpdateMode: (b: boolean) => void;
  private setOldValue: (x: IProvision) => void;
  private parent: IProcess;

  constructor(
    model: MMELModel,
    process: IProcess,
    oldValue: IProvision | null,
    setAdd: (b: boolean) => void,
    setUpdate: (b: boolean) => void,
    setOldValue: (x: IProvision) => void,
    forceUpdate: () => void,
    data: IProvision,
    setAttribute: (x: IProvision) => void
  ) {
    this.model = model;
    this.oldValue = oldValue;
    this.parent = process;
    this.setAddMode = setAdd;
    this.setUpdateMode = setUpdate;
    this.forceUpdate = forceUpdate;
    this.setOldValue = setOldValue;
    this.data = data;
    this.setData = setAttribute;
  }

  getItems = (): Array<ProvisionListItem> => {
    const out: Array<ProvisionListItem> = [];
    this.parent.provision.forEach((p, index) => {
      out.push(new ProvisionListItem('' + index, p.condition, '' + index));
    });
    return out;
  };

  addItemClicked = () => {
    this.data = { modality: '', condition: '', ref: [] };
    this.setData({ ...this.data });
    this.setAddMode(true);
  };

  removeItem = (refs: Array<string>) => {
    for (let i = refs.length - 1; i >= 0; i--) {
      this.parent.provision.splice(parseInt(refs[i]), 1);
    }
    this.forceUpdate();
  };

  updateItem = (ref: string) => {
    const x = parseInt(ref);
    if (!isNaN(x)) {
      const r = this.parent.provision[x];
      this.data = { ...r };
      this.setData({ ...this.data });
      this.setOldValue(r);
      this.setUpdateMode(true);
    }
  };

  private getFields = (): Array<JSX.Element> => {
    const elms: Array<JSX.Element> = [];
    const opt: Array<string> = [];
    this.model.refs.map(r => {
      opt.push(r.id);
    });
    elms.push(
      <NormalTextField
        key="field#provisionText"
        text="Provision Text"
        value={this.data.condition}
        update={(x: string) => {
          this.data.condition = x;
          this.setData({ ...this.data });
        }}
      />
    );
    elms.push(
      <NormalComboBox
        key="field#provisionModality"
        text="Provision Modality"
        value={this.data.modality}
        options={MODAILITYOPTIONS}
        update={(x: string) => {
          this.data.modality = x;
          this.setData({ ...this.data });
        }}
      />
    );
    elms.push(
      <MultiReferenceSelector
        key="field#attributeReference"
        text="Reference"
        options={opt}
        values={this.data.ref}
        filterName="Reference filter"
        add={(x: Array<string>) => {
          this.data.ref = this.data.ref.concat(x);
          this.setData({ ...this.data });
        }}
        remove={(x: Array<string>) => {
          x.map(r => {
            const index = this.data.ref.indexOf(r);
            if (index !== -1) {
              this.data.ref.splice(index, 1);
            }
          });
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
    this.parent.provision.push(this.data);
    this.setAddMode(false);
  };

  addCancel = () => {
    this.data = { modality: '', condition: '', ref: [] };
    this.setAddMode(false);
  };

  getUpdateFields = (): Array<JSX.Element> => {
    return this.getFields();
  };

  updateClicked = () => {
    this.setUpdateMode(false);
    if (this.oldValue !== null) {
      this.oldValue.condition = this.data.condition;
      this.oldValue.modality = this.data.modality;
      this.oldValue.ref = this.data.ref;
      this.forceUpdate();
    }
  };

  updateCancel = () => {
    this.data = { modality: '', condition: '', ref: [] };
    this.setUpdateMode(false);
  };
}

export class ProvisionListItem implements IListItem {
  id: string;
  text = '';
  reference: string;

  constructor(a: string, b: string, c: string) {
    this.id = a;
    this.text = b;
    this.reference = c;
  }
}
