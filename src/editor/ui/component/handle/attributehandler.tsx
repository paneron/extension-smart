import React from 'react';
import { DATATYPE, MODAILITYOPTIONS } from '../../../runtime/idManager';
import { MMELModel } from '../../../serialize/interface/model';
import { IAttribute, IAttributeContainer } from '../../interface/datainterface';
import {
  IAddItem,
  IList,
  IListItem,
  IUpdateItem,
} from '../../interface/fieldinterface';
import { functionCollection } from '../../util/function';
import NormalComboBox from '../unit/combobox';
import {
  MultiReferenceSelector,
  ReferenceSelector,
} from '../unit/referenceselect';
import NormalTextField from '../unit/textfield';

export class AttributeHandler implements IList, IAddItem, IUpdateItem {
  filterName = 'Attribute filter';
  itemName = 'Attribute';
  private model: MMELModel;
  private setAddMode: (b: boolean) => void;
  private updating: IAttribute | null;
  private data: IAttribute;
  private setData: (x: IAttribute) => void;
  private forceUpdate: () => void;
  private setUpdateMode: (b: boolean) => void;
  private setUpdateAttribute: (x: IAttribute) => void;
  private parent: IAttributeContainer;

  constructor(
    model: MMELModel,
    reg: IAttributeContainer,
    updateObj: IAttribute | null,
    setAdd: (b: boolean) => void,
    setUpdate: (b: boolean) => void,
    setUpdateAttribute: (x: IAttribute) => void,
    forceUpdate: () => void,
    data: IAttribute,
    setAttribute: (x: IAttribute) => void
  ) {
    this.model = model;
    this.updating = updateObj;
    this.parent = reg;
    this.setAddMode = setAdd;
    this.setUpdateMode = setUpdate;
    this.forceUpdate = forceUpdate;
    this.setUpdateAttribute = setUpdateAttribute;
    this.data = data;
    this.setData = setAttribute;
  }

  getItems = (): Array<AttributeListItem> => {
    const out: Array<AttributeListItem> = [];
    this.parent.attributes.forEach((r, index) => {
      out.push(new AttributeListItem(r.id, r.definition, '' + index));
    });
    return out;
  };

  addItemClicked = () => {
    this.data = {
      id: '',
      definition: '',
      cardinality: '',
      modality: '',
      ref: [],
      type: '',
    };
    this.setData({ ...this.data });
    this.setAddMode(true);
  };

  removeItem = (refs: Array<string>) => {
    for (let i = refs.length - 1; i >= 0; i--) {
      this.parent.attributes.splice(parseInt(refs[i]), 1);
    }
    this.forceUpdate();
  };

  updateItem = (ref: string) => {
    const x = parseInt(ref);
    if (!isNaN(x)) {
      const r = this.parent.attributes[x];
      this.data = { ...r };
      this.setData({ ...this.data });
      this.setUpdateAttribute(r);
      this.setUpdateMode(true);
    }
  };

  private getFields = (): Array<JSX.Element> => {
    const mw = functionCollection.getStateMan().state.modelWrapper;
    const elms: Array<JSX.Element> = [];
    const opt: Array<string> = [];
    this.model.refs.map(r => {
      opt.push(r.id);
    });
    const types: Array<string> = [...DATATYPE];
    this.model.regs.map(d => {
      if (d.data !== null) {
        types.push(d.data.id);
        types.push('reference(' + d.data.id + ')');
      }
    });
    this.model.dataclasses.map(d => {
      if (mw.dlman.get(d).mother === null) {
        types.push(d.id);
      }
    });
    this.model.enums.map(en => {
      types.push(en.id);
    });
    elms.push(
      <NormalTextField
        key="field#attributeid"
        text="Attribute ID"
        value={this.data.id}
        update={(x: string) => {
          this.data.id = x.replaceAll(/\s+/g, '');
          this.setData({ ...this.data });
        }}
      />
    );
    elms.push(
      <NormalTextField
        key="field#attributedefinition"
        text="Attribute Definition"
        value={this.data.definition}
        update={(x: string) => {
          this.data.definition = x;
          this.setData({ ...this.data });
        }}
      />
    );
    elms.push(
      <NormalTextField
        key="field#attributeCardinality"
        text="Attribute Cardinality"
        value={this.data.cardinality}
        update={(x: string) => {
          this.data.cardinality = x;
          this.setData({ ...this.data });
        }}
      />
    );
    elms.push(
      <NormalComboBox
        key="field#attributeModality"
        text="Attribute Modality"
        value={this.data.modality}
        options={MODAILITYOPTIONS}
        update={(x: string) => {
          this.data.modality = x;
          this.setData({ ...this.data });
        }}
      />
    );
    elms.push(
      <ReferenceSelector
        key="field#attributeType"
        text="Attribute Type"
        filterName="Type filter"
        value={this.data.type}
        options={types}
        update={(x: number) => {
          if (x !== -1) {
            this.data.type = types[x];
            this.setData({ ...this.data });
          }
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
    if (this.data.id === '') {
      alert('ID is empty');
      return;
    }
    for (const a of this.parent.attributes) {
      if (a.id === this.data.id) {
        alert('ID already exists');
        return;
      }
    }
    this.parent.attributes.push(this.data);
    this.setAddMode(false);
  };

  addCancel = () => {
    this.data = {
      id: '',
      definition: '',
      cardinality: '',
      modality: '',
      ref: [],
      type: '',
    };
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
        for (const a of this.parent.attributes) {
          if (a.id === this.data.id) {
            alert('New ID already exists');
            return;
          }
        }
      }
      this.updating.id = this.data.id;
      this.updating.definition = this.data.definition;
      this.updating.cardinality = this.data.cardinality;
      this.updating.type = this.data.type;
      this.updating.ref = this.data.ref;
      this.updating.modality = this.data.modality;
      this.forceUpdate();
    }
  };

  updateCancel = () => {
    this.data = {
      id: '',
      definition: '',
      cardinality: '',
      modality: '',
      ref: [],
      type: '',
    };
    this.setUpdateMode(false);
  };
}

export class AttributeListItem implements IListItem {
  id: string;
  text = '';
  reference: string;

  constructor(a: string, b: string, c: string) {
    this.id = a;
    this.text = b;
    this.reference = c;
  }
}
