import React from 'react';
import { VarType, VAR_TYPES } from '../../../runtime/idManager';
import { MMELFactory } from '../../../runtime/modelComponentCreator';
import { MMELModel } from '../../../serialize/interface/model';
import { MMELVariable } from '../../../serialize/interface/supportinterface';
import { IVar } from '../../interface/datainterface';

import {
  IAddItem,
  IList,
  IListItem,
  IUpdateItem,
} from '../../interface/fieldinterface';
import { functionCollection } from '../../util/function';
import NormalComboBox from '../unit/combobox';
import { ReferenceSelector } from '../unit/referenceselect';
import NormalTextField from '../unit/textfield';

const INTRO = (
  <div key="ui#measurement#introtext">
    Measurement types:
    <ul>
      <li> {VarType.DATA} : A single measurement value given by the user </li>
      <li> {VarType.LISTDATA} : A list of data items provided by the user</li>
      <li> {VarType.DERIVED} : Calulated from other measurement values </li>
    </ul>
    The definition field is applicable to {VarType.DERIVED} only. Example
    definitions:
    <ul>
      <li> [numPersons_Sales] + [numPersons_HR] </li>
      <li> [temperature].average </li>
    </ul>
    The first example adds two single measurements together which represent the
    total number of people in the two departments. The second one has an input
    of a list of temperature readings (e.g., from sensors). It calculates the
    average temperature from the sensor.
  </div>
);

export class VarHandler implements IList, IAddItem, IUpdateItem {
  filterName = 'Measurement filter';
  itemName = 'Measurements';
  private model: MMELModel;
  private setAddMode: (b: boolean) => void;
  private updating: MMELVariable | null;
  private data: IVar;
  private setData: (x: IVar) => void;
  private forceUpdate: () => void;
  private setUpdateMode: (b: boolean) => void;
  private setUpdateVar: (x: MMELVariable) => void;

  constructor(
    model: MMELModel,
    updateObj: MMELVariable | null,
    setAdd: (b: boolean) => void,
    setUpdate: (b: boolean) => void,
    setUpdateVar: (x: MMELVariable) => void,
    forceUpdate: () => void,
    data: IVar,
    setVar: (x: IVar) => void
  ) {
    this.model = model;
    this.updating = updateObj;
    this.setAddMode = setAdd;
    this.setUpdateMode = setUpdate;
    this.forceUpdate = forceUpdate;
    this.setUpdateVar = setUpdateVar;
    this.data = data;
    this.setData = setVar;
  }

  getItems = (): Array<VarListItem> => {
    const out: Array<VarListItem> = [];
    this.model.vars.forEach((v, index) => {
      out.push(new VarListItem(v.id, v.id, '' + index));
    });
    return out;
  };

  addItemClicked = () => {
    this.data.id = '';
    this.data.type = VarType.DATA;
    this.data.definition = '';
    this.data.description = '';
    this.setData({ ...this.data });
    this.setAddMode(true);
  };

  removeItem = (refs: Array<string>) => {
    const idman = functionCollection.getStateMan().state.modelWrapper.idman;
    for (let i = refs.length - 1; i >= 0; i--) {
      const removed = this.model.vars.splice(parseInt(refs[i]), 1);
      if (removed.length > 0) {
        const r = removed[0];
        idman.vars.delete(r.id);
      }
    }
    this.forceUpdate();
  };

  updateItem = (ref: string) => {
    const x = parseInt(ref);
    if (!isNaN(x)) {
      const r = this.model.vars[x];
      this.data.id = r.id;
      this.data.type = r.type;
      this.data.definition = r.definition;
      this.data.description = r.description;
      this.setData({ ...this.data });
      this.setUpdateVar(r);
      this.setUpdateMode(true);
    }
  };

  private getFields = (): Array<JSX.Element> => {
    const elms: Array<JSX.Element> = [];
    const types: Array<string> = [];
    const sm = functionCollection.getStateMan();
    sm.state.modelWrapper.model.vars.forEach(v => {
      types.push(v.id);
    });
    elms.push(INTRO);
    elms.push(
      <NormalTextField
        key="field#varid"
        text="Measurement ID"
        value={this.data.id}
        update={(x: string) => {
          this.data.id = x.replaceAll(/\s+/g, '');
          this.setData({ ...this.data });
        }}
      />
    );
    elms.push(
      <NormalTextField
        key="field#vardescription"
        text="Measurement description"
        value={this.data.description}
        update={(x: string) => {
          this.data.description = x;
          this.setData({ ...this.data });
        }}
      />
    );
    elms.push(
      <NormalComboBox
        key="field#vartype"
        text="Measurement Type"
        value={this.data.type}
        options={VAR_TYPES}
        update={(x: string) => {
          this.data.type = x;
          this.setData({ ...this.data });
        }}
      />
    );
    elms.push(
      <ReferenceSelector
        key="field#vardefinition"
        text="Measurement definition"
        filterName="Measurement filter"
        editable={true}
        value={
          this.data.type === VarType.DERIVED ? this.data.definition : 'disabled'
        }
        options={types}
        update={(x: number) => {
          if (x !== -1) {
            this.data.definition += '[' + types[x] + ']';
            this.setData({ ...this.data });
          }
        }}
        onChange={(x: string) => {
          this.data.definition = x;
          this.setData({ ...this.data });
        }}
      />
    );
    if (this.data.type === VarType.DERIVED) {
      elms.push(
        <div key="ui#measurement#builderbutton#holder">
          <button
            key="ui#measurement#builderbutton"
            onClick={() => validCheck(this.data.definition, this.model)}
          >
            {' '}
            Definition validity check{' '}
          </button>
        </div>
      );
    }
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
    const idreg = functionCollection.getStateMan().state.modelWrapper.idman;
    if (idreg.vars.has(this.data.id)) {
      alert('ID already exists');
    } else {
      const variable = MMELFactory.createVariable(this.data.id);
      variable.type = this.data.type;
      variable.definition =
        this.data.type === VarType.DERIVED ? this.data.definition : '';
      variable.description = this.data.description;
      idreg.vars.set(variable.id, variable);
      this.model.vars.push(variable);
      this.setAddMode(false);
    }
  };

  addCancel = () => {
    this.setAddMode(false);
  };

  getUpdateFields = (): Array<JSX.Element> => {
    return this.getFields();
  };

  updateClicked = () => {
    if (this.updating !== null) {
      const idreg = functionCollection.getStateMan().state.modelWrapper.idman;
      if (this.data.id !== this.updating.id) {
        if (this.data.id === '') {
          alert('New ID is empty');
          return;
        }
        if (idreg.vars.has(this.data.id)) {
          alert('New ID already exists');
          return;
        }
      }
      idreg.vars.delete(this.updating.id);
      idreg.vars.set(this.data.id, this.updating);
      this.updating.id = this.data.id;
      this.updating.type = this.data.type;
      this.updating.description = this.data.description;
      this.updating.definition =
        this.data.type === VarType.DERIVED ? this.data.definition : '';
      this.setUpdateMode(false);
    }
  };

  updateCancel = () => {
    this.setUpdateMode(false);
  };
}

export class VarListItem implements IListItem {
  id: string;
  text = '';
  reference: string;

  constructor(a: string, b: string, c: string) {
    this.id = a;
    this.text = b;
    this.reference = c;
  }
}

function validCheck(def: string, m: MMELModel) {
  const idreg = functionCollection.getStateMan().state.modelWrapper.idman;
  const results = Array.from(def.matchAll(/\[.*?\]/g));
  let ok = true;
  for (const r of results) {
    const name = r[0].substr(1, r[0].length - 2);
    if (!idreg.vars.has(name)) {
      alert(name + ' is not a measurement');
      ok = false;
    }
  }
  if (ok) {
    alert('All measurement names can be resolved');
  }
}
