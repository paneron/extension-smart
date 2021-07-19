import React from 'react';
import { MMELFactory } from '../../../runtime/modelComponentCreator';
import { MMELModel } from '../../../serialize/interface/model';
import { MMELRole } from '../../../serialize/interface/supportinterface';
import { IRole } from '../../interface/datainterface';
import {
  IAddItem,
  IList,
  IListItem,
  IUpdateItem,
} from '../../interface/fieldinterface';
import { functionCollection } from '../../util/function';
import NormalTextField from '../unit/textfield';

export class RoleHandler implements IList, IAddItem, IUpdateItem {
  filterName = 'Role filter';
  itemName = 'Roles';
  private model: MMELModel;
  private setAddMode: (b: boolean) => void;
  private updating: MMELRole | null;
  private data: IRole;
  private setData: (x: IRole) => void;
  private forceUpdate: () => void;
  private setUpdateMode: (b: boolean) => void;
  private setUpdateRole: (x: MMELRole) => void;

  constructor(
    model: MMELModel,
    updateObj: MMELRole | null,
    setAdd: (b: boolean) => void,
    setUpdate: (b: boolean) => void,
    setUpdateRole: (x: MMELRole) => void,
    forceUpdate: () => void,
    data: IRole,
    setRole: (x: IRole) => void
  ) {
    this.model = model;
    this.updating = updateObj;
    this.setAddMode = setAdd;
    this.setUpdateMode = setUpdate;
    this.forceUpdate = forceUpdate;
    this.setUpdateRole = setUpdateRole;
    this.data = data;
    this.setData = setRole;
  }

  getItems = (): Array<RoleListItem> => {
    const out: Array<RoleListItem> = [];
    this.model.roles.forEach((r, index) => {
      out.push(new RoleListItem(r.id, r.name, '' + index));
    });
    return out;
  };

  addItemClicked = () => {
    this.data.roleid = '';
    this.data.rolename = '';
    this.setData({ ...this.data });
    this.setAddMode(true);
  };

  removeItem = (refs: Array<string>) => {
    const mw = functionCollection.getStateMan().state.modelWrapper;
    for (let i = refs.length - 1; i >= 0; i--) {
      const removed = this.model.roles.splice(parseInt(refs[i]), 1);
      if (removed.length > 0) {
        const r = removed[0];
        for (const p of this.model.processes) {
          if (p.actor === r) {
            p.actor = null;
          }
        }
        for (const p of this.model.approvals) {
          if (p.actor === r) {
            p.actor = null;
          }
          if (p.approver === r) {
            p.approver = null;
          }
        }
        mw.idman.roles.delete(r.id);
      }
    }
    this.forceUpdate();
  };

  updateItem = (ref: string) => {
    const x = parseInt(ref);
    if (!isNaN(x)) {
      const r = this.model.roles[x];
      this.data.roleid = r.id;
      this.data.rolename = r.name;
      this.setData({ ...this.data });
      this.setUpdateRole(r);
      this.setUpdateMode(true);
    }
  };

  private getFields = (): Array<JSX.Element> => {
    const elms: Array<JSX.Element> = [];
    elms.push(
      <NormalTextField
        key="field#roleid"
        text="Role ID"
        value={this.data.roleid}
        update={(x: string) => {
          this.data.roleid = x.replaceAll(/\s+/g, '');
          this.setData({ ...this.data });
        }}
      />
    );
    elms.push(
      <NormalTextField
        key="field#rolename"
        text="Role Name"
        value={this.data.rolename}
        update={(x: string) => {
          this.data.rolename = x;
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
    const mw = functionCollection.getStateMan().state.modelWrapper;
    if (this.data.roleid === '') {
      alert('ID is empty');
      return;
    }
    const idreg = mw.idman;
    if (idreg.roles.has(this.data.roleid)) {
      alert('ID already exists');
    } else {
      const role = MMELFactory.createRole(this.data.roleid);
      idreg.roles.set(role.id, role);
      role.name = this.data.rolename;
      this.model.roles.push(role);
      this.setAddMode(false);
    }
  };

  addCancel = () => {
    this.data.roleid = '';
    this.data.rolename = '';
    this.setAddMode(false);
  };

  getUpdateFields = (): Array<JSX.Element> => {
    return this.getFields();
  };

  updateClicked = () => {
    const mw = functionCollection.getStateMan().state.modelWrapper;
    if (this.updating !== null) {
      const idreg = mw.idman;
      if (this.data.roleid !== this.updating.id) {
        if (this.data.roleid === '') {
          alert('New ID is empty');
          return;
        }
        if (idreg.roles.has(this.data.roleid)) {
          alert('New ID already exists');
          return;
        }
      }
      idreg.roles.delete(this.updating.id);
      idreg.roles.set(this.data.roleid, this.updating);
      this.updating.id = this.data.roleid;
      this.updating.name = this.data.rolename;
      this.setUpdateMode(false);
    }
  };

  updateCancel = () => {
    this.data.roleid = '';
    this.data.rolename = '';
    this.setUpdateMode(false);
  };
}

export class RoleListItem implements IListItem {
  id: string;
  text = '';
  reference: string;

  constructor(a: string, b: string, c: string) {
    this.id = a;
    this.text = b;
    this.reference = c;
  }
}
