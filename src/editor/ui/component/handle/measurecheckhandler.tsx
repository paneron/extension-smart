import React from 'react';
import { IProcess } from '../../interface/datainterface';
import {
  IAddItem,
  IList,
  IListItem,
  IUpdateItem,
} from '../../interface/fieldinterface';
import { functionCollection } from '../../util/function';
import { ReferenceSelector } from '../unit/referenceselect';

export class MeasureHandler implements IList, IAddItem, IUpdateItem {
  filterName = 'Measurement validation filter';
  itemName = 'Measurement validation';
  private setAddMode: (b: boolean) => void;
  private oldIndex: number | null;
  private data: string;
  private setData: (x: string) => void;
  private forceUpdate: () => void;
  private setUpdateMode: (b: boolean) => void;
  private setOldIndex: (x: number) => void;
  private parent: IProcess;

  constructor(
    process: IProcess,
    oldIndex: number | null,
    setAdd: (b: boolean) => void,
    setUpdate: (b: boolean) => void,
    setOldIndex: (x: number) => void,
    forceUpdate: () => void,
    data: string,
    setData: (x: string) => void
  ) {
    this.oldIndex = oldIndex;
    this.parent = process;
    this.setAddMode = setAdd;
    this.setUpdateMode = setUpdate;
    this.forceUpdate = forceUpdate;
    this.setOldIndex = setOldIndex;
    this.data = data;
    this.setData = setData;
  }

  getItems = (): Array<MeasurementListItem> => {
    const out: Array<MeasurementListItem> = [];
    this.parent.measure.forEach((m, index) => {
      out.push(new MeasurementListItem('' + index, m, '' + index));
    });
    return out;
  };

  addItemClicked = () => {
    this.setData('');
    this.setAddMode(true);
  };

  removeItem = (refs: Array<string>) => {
    for (let i = refs.length - 1; i >= 0; i--) {
      this.parent.measure.splice(parseInt(refs[i]), 1);
    }
    this.forceUpdate();
  };

  updateItem = (ref: string) => {
    const x = parseInt(ref);
    if (!isNaN(x)) {
      this.setData(this.parent.measure[x]);
      this.setOldIndex(x);
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
    elms.push(
      <ReferenceSelector
        key="field#measurementText"
        text="Measurement validation"
        filterName="Measurement filter"
        editable={true}
        value={this.data}
        options={types}
        update={(x: number) => {
          if (x !== -1) {
            this.setData(this.data + '[' + types[x] + ']');
          }
        }}
        onChange={(x: string) => {
          this.setData(x);
        }}
      />
    );
    elms.push(
      <div key="ui#measurement#validatorbutton#holder">
        <button
          key="ui#measurement#validatorbutton"
          onClick={() => validCheck(this.data)}
        >
          {' '}
          Validator check{' '}
        </button>
      </div>
    );
    return elms;
  };

  getAddFields = (): Array<JSX.Element> => {
    return this.getFields();
  };

  addClicked = () => {
    this.parent.measure.push(this.data);
    this.setAddMode(false);
  };

  addCancel = () => {
    this.setAddMode(false);
  };

  getUpdateFields = (): Array<JSX.Element> => {
    return this.getFields();
  };

  updateClicked = () => {
    this.setUpdateMode(false);
    if (this.oldIndex !== null) {
      this.parent.measure[this.oldIndex] = this.data;
      this.forceUpdate();
    }
  };

  updateCancel = () => {
    this.setUpdateMode(false);
  };
}

export class MeasurementListItem implements IListItem {
  id: string;
  text = '';
  reference: string;

  constructor(a: string, b: string, c: string) {
    this.id = a;
    this.text = b;
    this.reference = c;
  }
}

function validCheck(def: string) {
  const sm = functionCollection.getStateMan();
  const idreg = sm.state.modelWrapper.idman;
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
