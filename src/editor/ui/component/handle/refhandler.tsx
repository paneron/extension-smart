import React from 'react';
import { toSummary } from '../../../runtime/functions';
import { MMELFactory } from '../../../runtime/modelComponentCreator';
import { MMELReference } from '../../../serialize/interface/supportinterface';
import { IRef } from '../../interface/datainterface';
import {
  IAddItem,
  IList,
  IListItem,
  IUpdateItem,
} from '../../interface/fieldinterface';
import { ModelWrapper } from '../../model/modelwrapper';
import NormalTextField from '../unit/textfield';

export class RefHandler implements IList, IAddItem, IUpdateItem {
  filterName = 'Reference filter';
  itemName = 'References';
  private mw: ModelWrapper;
  private setAddMode: (b: boolean) => void;
  private updating: MMELReference | null;
  private data: IRef;
  private setData: (x: IRef) => void;
  private forceUpdate: () => void;
  private setUpdateMode: (b: boolean) => void;
  private setUpdateRef: (x: MMELReference) => void;

  constructor(
    mw: ModelWrapper,
    updateObj: MMELReference | null,
    setAdd: (b: boolean) => void,
    setUpdate: (b: boolean) => void,
    setUpdateRef: (x: MMELReference) => void,
    forceUpdate: () => void,
    data: IRef,
    setRef: (x: IRef) => void
  ) {
    this.mw = mw;
    this.updating = updateObj;
    this.setAddMode = setAdd;
    this.setUpdateMode = setUpdate;
    this.forceUpdate = forceUpdate;
    this.setUpdateRef = setUpdateRef;
    this.data = data;
    this.setData = setRef;
  }

  getItems = (): Array<RefListItem> => {
    const out: Array<RefListItem> = [];
    this.mw.model.refs.forEach((r, index) => {
      out.push(new RefListItem(r.id, toSummary(r), '' + index));
    });
    return out;
  };

  addItemClicked = () => {
    this.data.refid = '';
    this.data.document = '';
    this.data.clause = '';
    this.setData({ ...this.data });
    this.setAddMode(true);
  };

  removeItem = (refs: Array<string>) => {
    for (let i = refs.length - 1; i >= 0; i--) {
      const removed = this.mw.model.refs.splice(parseInt(refs[i]), 1);
      if (removed.length > 0) {
        const r = removed[0];
        for (const p of this.mw.model.provisions) {
          for (let j = 0; j < p.ref.length; j++) {
            if (p.ref[j] === r) {
              p.ref.splice(j, 1);
              break;
            }
          }
        }
        for (const app of this.mw.model.approvals) {
          for (let j = 0; j < app.ref.length; j++) {
            if (app.ref[j] === r) {
              app.ref.splice(j, 1);
              break;
            }
          }
        }
        for (const d of this.mw.model.dataclasses) {
          for (const a of d.attributes) {
            for (let j = 0; j < a.ref.length; j++) {
              if (a.ref[j] === r) {
                a.ref.splice(j, 1);
                break;
              }
            }
          }
        }
        this.mw.idman.refs.delete(r.id);
        this.mw.filterman.readDocu(this.mw.model.refs);
      }
    }
    this.forceUpdate();
  };

  updateItem = (ref: string) => {
    const x = parseInt(ref);
    if (!isNaN(x)) {
      const r = this.mw.model.refs[x];
      this.data.refid = r.id;
      this.data.document = r.document;
      this.data.clause = r.clause;
      this.setData({ ...this.data });
      this.setUpdateRef(r);
      this.setUpdateMode(true);
    }
  };

  private getFields = (): Array<JSX.Element> => {
    const elms: Array<JSX.Element> = [];
    elms.push(
      <NormalTextField
        key="field#refid"
        text="Reference ID"
        value={this.data.refid}
        update={(x: string) => {
          this.data.refid = x.replaceAll(/\s+/g, '');
          this.setData({ ...this.data });
        }}
      />
    );
    elms.push(
      <NormalTextField
        key="field#document"
        text="Document"
        value={this.data.document}
        update={(x: string) => {
          this.data.document = x;
          this.setData({ ...this.data });
        }}
      />
    );
    elms.push(
      <NormalTextField
        key="field#clause"
        text="Clause"
        value={this.data.clause}
        update={(x: string) => {
          this.data.clause = x;
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
    const idreg = this.mw.idman;
    if (this.data.clause.indexOf(',') !== -1) {
      const rs = this.data.clause.split(',');
      for (let r of rs) {
        r = r.trim();
        const id = (this.data.refid + r.replaceAll('.', '-')).trim();
        if (!idreg.refs.has(id)) {
          const ref = MMELFactory.createReference(id);
          idreg.refs.set(id, ref);
          ref.document = this.data.document;
          ref.clause = r;
          this.mw.model.refs.push(ref);
        }
      }
      this.mw.filterman.readDocu(this.mw.model.refs);
      this.setAddMode(false);
    } else {
      if (this.data.refid === '') {
        alert('ID is empty');
        return;
      }
      if (idreg.refs.has(this.data.refid)) {
        alert('ID already exists');
      } else {
        const ref = MMELFactory.createReference(this.data.refid);
        idreg.refs.set(ref.id, ref);
        ref.document = this.data.document;
        ref.clause = this.data.clause;
        this.mw.model.refs.push(ref);
        this.mw.filterman.readDocu(this.mw.model.refs);
        this.setAddMode(false);
      }
    }
  };

  addCancel = () => {
    this.data.refid = '';
    this.data.document = '';
    this.data.clause = '';
    this.setAddMode(false);
  };

  getUpdateFields = (): Array<JSX.Element> => {
    return this.getFields();
  };

  updateClicked = () => {
    if (this.updating !== null) {
      const idreg = this.mw.idman;
      if (this.data.refid !== this.updating.id) {
        if (this.data.refid === '') {
          alert('ID is empty');
          return;
        }
        if (idreg.refs.has(this.data.refid)) {
          alert('New ID already exists');
          return;
        }
      }
      idreg.refs.delete(this.updating.id);
      idreg.refs.set(this.data.refid, this.updating);
      this.updating.id = this.data.refid;
      this.updating.document = this.data.document;
      this.updating.clause = this.data.clause;
      this.mw.filterman.readDocu(this.mw.model.refs);
      this.setUpdateMode(false);
    }
  };

  updateCancel = () => {
    this.data.refid = '';
    this.data.document = '';
    this.data.clause = '';
    this.setUpdateMode(false);
  };
}

export class RefListItem implements IListItem {
  id: string;
  text = '';
  reference: string;

  constructor(a: string, b: string, c: string) {
    this.id = a;
    this.text = b;
    this.reference = c;
  }
}
