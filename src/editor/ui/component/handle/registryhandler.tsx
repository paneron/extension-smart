import React from 'react';
import { MMELFactory } from '../../../runtime/modelComponentCreator';
import { MMELRegistry } from '../../../serialize/interface/datainterface';
import { IAttribute, IRegistry } from '../../interface/datainterface';
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

export class RegistryHandler implements IList, IAddItem, IUpdateItem {
  filterName = 'Registry filter';
  itemName = 'Registry';
  private mw: ModelWrapper;
  private setAddMode: (b: boolean) => void;
  private updating: MMELRegistry | null;
  private data: IRegistry;
  private setData: (x: IRegistry) => void;
  private forceUpdate: () => void;
  private setUpdateMode: (b: boolean) => void;
  private setUpdateRegistry: (x: MMELRegistry) => void;

  constructor(
    mw: ModelWrapper,
    updateObj: MMELRegistry | null,
    setAdd: (b: boolean) => void,
    setUpdate: (b: boolean) => void,
    setUpdateRegistry: (x: MMELRegistry) => void,
    forceUpdate: () => void,
    data: IRegistry,
    setRegistry: (x: IRegistry) => void
  ) {
    this.mw = mw;
    this.updating = updateObj;
    this.setAddMode = setAdd;
    this.setUpdateMode = setUpdate;
    this.forceUpdate = forceUpdate;
    this.setUpdateRegistry = setUpdateRegistry;
    this.data = data;
    this.setData = setRegistry;
  }

  getItems = (): Array<RegistryListItem> => {
    const out: Array<RegistryListItem> = [];
    this.mw.model.regs.forEach((r, index) => {
      out.push(new RegistryListItem(r.id, r.title, '' + index));
    });
    return out;
  };

  addItemClicked = () => {
    this.data.regid = '';
    this.data.regtitle = '';
    this.data.attributes = [];
    this.setData({ ...this.data });
    this.setAddMode(true);
  };

  removeItem = (refs: Array<string>) => {
    for (let i = refs.length - 1; i >= 0; i--) {
      const removed = this.mw.model.regs.splice(parseInt(refs[i]), 1);
      if (removed.length > 0) {
        const r = removed[0];
        this.mw.idman.nodes.delete(r.id);
        this.mw.idman.regs.delete(r.id);
        // remove data from process input
        for (const p of this.mw.model.processes) {
          let index = p.input.indexOf(r);
          if (index !== -1) {
            p.input.splice(index, 1);
          }
          index = p.output.indexOf(r);
          if (index !== -1) {
            p.output.splice(index, 1);
          }
        }
        // remove data from process output
        for (const p of this.mw.model.approvals) {
          const index = p.records.indexOf(r);
          if (index !== -1) {
            p.records.splice(index, 1);
          }
        }
        const d = r.data;
        if (d !== null) {
          let index = this.mw.model.dataclasses.indexOf(d);
          this.mw.model.dataclasses.splice(index, 1);
          for (const dc of this.mw.model.dataclasses) {
            for (const a of dc.attributes) {
              index = a.type.indexOf(d.id);
              if (index !== -1) {
                a.type = '';
              }
              this.mw.dlman.get(dc).rdcs.delete(d);
            }
          }
          this.mw.idman.nodes.delete(d.id);
          this.mw.idman.dcs.delete(d.id);
          functionCollection.removeLayoutItem(r.id);
        }
      }
    }
    this.forceUpdate();
  };

  updateItem = (ref: string) => {
    const x = parseInt(ref);
    if (!isNaN(x)) {
      const r = this.mw.model.regs[x];
      this.data.regid = r.id;
      this.data.regtitle = r.title;
      this.data.attributes = [];
      if (r.data !== null) {
        r.data.attributes.map(a => {
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
      }
      this.setData({ ...this.data });
      this.setUpdateRegistry(r);
      this.setUpdateMode(true);
    }
  };

  private getFields = (): Array<JSX.Element> => {
    const elms: Array<JSX.Element> = [];
    elms.push(
      <NormalTextField
        key="field#registryid"
        text="Registry ID"
        value={this.data.regid}
        update={(x: string) => {
          this.data.regid = x.replaceAll(/\s+/g, '');
          this.setData({ ...this.data });
        }}
      />
    );
    elms.push(
      <NormalTextField
        key="field#regtitle"
        text="Registry title"
        value={this.data.regtitle}
        update={(x: string) => {
          this.data.regtitle = x;
          this.setData({ ...this.data });
        }}
      />
    );
    elms.push(
      <AttributeEditPage
        key={'ui#registry#attributeEditPage'}
        model={this.mw.model}
        atts={this.data}
        setAtts={x =>
          this.setData({
            ...x,
            regid: this.data.regid,
            regtitle: this.data.regtitle,
          })
        }
      />
    );
    return elms;
  };

  getAddFields = (): Array<JSX.Element> => {
    return this.getFields();
  };

  addClicked = () => {
    if (this.data.regid === '') {
      alert('ID is empty');
      return;
    }
    const model = this.mw.model;
    const idreg = this.mw.idman;
    if (idreg.nodes.has(this.data.regid)) {
      alert('ID already exists');
    } else {
      // add registry
      const nr = MMELFactory.createRegistry(this.data.regid);
      nr.title = this.data.regtitle;
      nr.data = MMELFactory.createDataClass(this.data.regid + '#data');
      this.mw.dlman.get(nr.data).mother = nr;
      for (const a of this.data.attributes) {
        const na = MMELFactory.createDataAttribute(a.id);
        na.definition = a.definition;
        na.cardinality = a.cardinality;
        na.type = a.type;
        for (const r of a.ref) {
          const ref = this.mw.idman.refs.get(r);
          if (ref !== undefined) {
            na.ref.push(ref);
          }
        }
        na.modality = a.modality;
        nr.data.attributes.push(na);
      }
      idreg.nodes.set(nr.id, nr);
      idreg.regs.set(nr.id, nr);
      idreg.nodes.set(nr.data.id, nr.data);
      idreg.dcs.set(nr.data.id, nr.data);
      model.regs.push(nr);
      model.dataclasses.push(nr.data);
      this.setAddMode(false);
    }
  };

  addCancel = () => {
    this.data.regid = '';
    this.data.regtitle = '';
    this.data.attributes = [];
    this.setAddMode(false);
  };

  getUpdateFields = (): Array<JSX.Element> => {
    return this.getFields();
  };

  updateClicked = () => {
    if (this.updating !== null) {
      const idreg = this.mw.idman;
      if (this.data.regid !== this.updating.id) {
        if (this.data.regid === '') {
          alert('New ID is empty');
          return;
        }
        if (idreg.nodes.has(this.data.regid)) {
          alert('New ID already exists');
          return;
        }
      }
      functionCollection.renameLayoutItem(this.updating.id, this.data.regid);
      idreg.nodes.delete(this.updating.id);
      idreg.regs.delete(this.updating.id);
      this.updating.id = this.data.regid;
      this.updating.title = this.data.regtitle;
      idreg.nodes.set(this.data.regid, this.updating);
      idreg.regs.set(this.data.regid, this.updating);
      let olddcname = '';
      if (this.updating.data !== null) {
        const dc = this.updating.data;
        idreg.nodes.delete(dc.id);
        idreg.dcs.delete(dc.id);
        olddcname = dc.id;
        dc.id = this.data.regid + '#data';
        idreg.nodes.set(dc.id, dc);
        idreg.dcs.set(dc.id, dc);
        this.mw.dlman.get(dc).rdcs.clear();
        dc.attributes = [];
        for (const a of this.data.attributes) {
          const na = MMELFactory.createDataAttribute(a.id);
          na.definition = a.definition;
          na.cardinality = a.cardinality;
          na.type = a.type;
          for (const r of a.ref) {
            const ref = this.mw.idman.refs.get(r);
            if (ref !== undefined) {
              na.ref.push(ref);
            }
          }
          na.modality = a.modality;
          dc.attributes.push(na);
        }
        for (const alldc of this.mw.model.dataclasses) {
          for (const a of alldc.attributes) {
            const index = a.type.indexOf(olddcname);
            if (index !== -1) {
              a.type = a.type.replace(olddcname, dc.id);
            }
          }
        }
      }
      this.setUpdateMode(false);
    }
  };

  updateCancel = () => {
    this.data.regid = '';
    this.data.regtitle = '';
    this.data.attributes = [];
    this.setUpdateMode(false);
  };
}

export class RegistryListItem implements IListItem {
  id: string;
  text = '';
  reference: string;

  constructor(a: string, b: string, c: string) {
    this.id = a;
    this.text = b;
    this.reference = c;
  }
}
