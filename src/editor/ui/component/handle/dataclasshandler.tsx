import React from 'react';
import { MMELFactory } from '../../../runtime/modelComponentCreator';
import { MMELDataClass } from '../../../serialize/interface/datainterface';
import { IAttribute, IDataclass } from '../../interface/datainterface';
import {
  IAddItem,
  IList,
  IListItem,
  IUpdateItem,
} from '../../interface/fieldinterface';
import { ModelWrapper } from '../../model/modelwrapper';
import { functionCollection } from '../../util/function';
import AttributeEditPage from '../edit/attributeedit';
import NormalTextField from '../unit/textfield';

export class DataclassHandler implements IList, IAddItem, IUpdateItem {
  filterName = 'Data structure filter';
  itemName = 'Data structure';
  private mw: ModelWrapper;
  private setAddMode: (b: boolean) => void;
  private updating: MMELDataClass | null;
  private data: IDataclass;
  private setData: (x: IDataclass) => void;
  private forceUpdate: () => void;
  private setUpdateMode: (b: boolean) => void;
  private setUpdateDataclass: (x: MMELDataClass) => void;

  constructor(
    mw: ModelWrapper,
    updateObj: MMELDataClass | null,
    setAdd: (b: boolean) => void,
    setUpdate: (b: boolean) => void,
    setUpdateRegistry: (x: MMELDataClass) => void,
    forceUpdate: () => void,
    data: IDataclass,
    setRegistry: (x: IDataclass) => void
  ) {
    this.mw = mw;
    this.updating = updateObj;
    this.setAddMode = setAdd;
    this.setUpdateMode = setUpdate;
    this.forceUpdate = forceUpdate;
    this.setUpdateDataclass = setUpdateRegistry;
    this.data = data;
    this.setData = setRegistry;
  }

  getItems = (): Array<DataclassListItem> => {
    const out: Array<DataclassListItem> = [];
    this.mw.model.dataclasses.forEach((d, index) => {
      if (this.mw.dlman.get(d).mother === null) {
        out.push(new DataclassListItem(d.id, d.id, '' + index));
      }
    });
    return out;
  };

  addItemClicked = () => {
    this.data.id = '';
    this.data.attributes = [];
    this.setData({ ...this.data });
    this.setAddMode(true);
  };

  removeItem = (refs: Array<string>) => {
    for (let i = refs.length - 1; i >= 0; i--) {
      const removed = this.mw.model.dataclasses.splice(parseInt(refs[i]), 1);
      if (removed.length > 0) {
        const r = removed[0];
        this.mw.idman.nodes.delete(r.id);
        this.mw.idman.dcs.delete(r.id);

        for (const dc of this.mw.model.dataclasses) {
          for (const a of dc.attributes) {
            const index = a.type.indexOf(r.id);
            if (index !== -1) {
              a.type = '';
            }
            this.mw.dlman.get(dc).rdcs.delete(r);
          }
        }
        functionCollection.removeLayoutItem(r.id);
      }
    }
    this.forceUpdate();
  };

  updateItem = (ref: string) => {
    const x = parseInt(ref);
    if (!isNaN(x)) {
      const r = this.mw.model.dataclasses[x];
      this.data.id = r.id;
      this.data.attributes = [];
      r.attributes.map(a => {
        const rs: Array<string> = [];
        a.ref.map(r => {
          rs.push(r.id);
        });
        const x: IAttribute = {
          id: a.id,
          definition: a.definition,
          cardinality: a.cardinality,
          type: a.type,
          modality: a.modality,
          ref: rs,
        };
        this.data.attributes.push(x);
      });
      this.setData({ ...this.data });
      this.setUpdateDataclass(r);
      this.setUpdateMode(true);
    }
  };

  private getFields = (): Array<JSX.Element> => {
    const elms: Array<JSX.Element> = [];
    elms.push(
      <NormalTextField
        key="field#dataclassid"
        text="Dataclass ID"
        value={this.data.id}
        update={(x: string) => {
          this.data.id = x.replaceAll(/\s+/g, '');
          this.setData({ ...this.data });
        }}
      />
    );
    elms.push(
      <AttributeEditPage
        key={'ui#dataclass#attributeEditPage'}
        model={this.mw.model}
        atts={this.data}
        setAtts={x => this.setData({ ...x, id: this.data.id })}
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
    if (idreg.nodes.has(this.data.id)) {
      alert('ID already exists');
    } else {
      // add data class
      const nr = MMELFactory.createDataClass(this.data.id);
      for (const a of this.data.attributes) {
        const na = MMELFactory.createDataAttribute(a.id);
        na.definition = a.definition;
        na.cardinality = a.cardinality;
        na.type = a.type;
        na.modality = a.modality;
        nr.attributes.push(na);
        for (const ref of a.ref) {
          const resolved = idreg.refs.get(ref);
          if (resolved !== undefined) {
            na.ref.push(resolved);
          }
        }
      }
      idreg.dcs.set(nr.id, nr);
      idreg.nodes.set(nr.id, nr);
      model.dataclasses.push(nr);
      this.setAddMode(false);
    }
  };

  addCancel = () => {
    this.data.id = '';
    this.data.attributes = [];
    this.setAddMode(false);
  };

  getUpdateFields = (): Array<JSX.Element> => {
    return this.getFields();
  };

  updateClicked = () => {
    if (this.updating !== null) {
      const idreg = this.mw.idman;
      const dc = this.updating;
      if (this.data.id !== dc.id) {
        if (this.data.id === '') {
          alert('New ID is empty');
          return;
        }
        if (idreg.nodes.has(this.data.id)) {
          alert('New ID already exists');
          return;
        }
      }
      for (const x of this.mw.model.dataclasses) {
        for (const a of x.attributes) {
          if (a.type === dc.id) {
            a.type = this.data.id;
          }
        }
      }
      functionCollection.renameLayoutItem(this.updating.id, this.data.id);
      idreg.nodes.delete(dc.id);
      idreg.dcs.delete(dc.id);
      dc.id = this.data.id;
      idreg.nodes.set(dc.id, dc);
      idreg.dcs.set(dc.id, dc);
      this.mw.dlman.get(dc).rdcs.clear();
      dc.attributes = [];
      for (const a of this.data.attributes) {
        const na = MMELFactory.createDataAttribute(a.id);
        na.definition = a.definition;
        na.cardinality = a.cardinality;
        na.type = a.type;
        na.modality = a.modality;
        dc.attributes.push(na);
        for (const ref of a.ref) {
          const resolved = idreg.refs.get(ref);
          if (resolved !== undefined) {
            na.ref.push(resolved);
          }
        }
      }
      this.setUpdateMode(false);
    }
  };

  updateCancel = () => {
    this.data.id = '';
    this.data.attributes = [];
    this.setUpdateMode(false);
  };
}

export class DataclassListItem implements IListItem {
  id: string;
  text = '';
  reference: string;

  constructor(a: string, b: string, c: string) {
    this.id = a;
    this.text = b;
    this.reference = c;
  }
}
