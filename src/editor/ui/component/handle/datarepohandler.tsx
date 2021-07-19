import React, { CSSProperties } from 'react';
import { DocumentItem, DocumentStore } from '../../../repository/document';
import {
  IAddItem,
  IList,
  IListItem,
  IUpdateItem,
} from '../../interface/fieldinterface';
import { functionCollection } from '../../util/function';
import NormalComboBox from '../unit/combobox';
import DataTimeTextField from '../unit/datetimefield';
import { ReferenceSelector } from '../unit/referenceselect';
import NormalTextField from '../unit/textfield';
import { MMELModel } from '../../../serialize/interface/model';
import {
  MMELDataClass,
  MMELEnum,
  MMELRegistry,
} from '../../../serialize/interface/datainterface';
import {
  BOOLEANOPTIONS,
  BOOLEANTYPE,
  DATETIMETYPE,
  EMPTYTYPE,
  ROLETYPE,
  STRINGTYPE,
} from '../../../runtime/idManager';
import { DataType } from '../../../serialize/interface/baseinterface';

const containercss: CSSProperties = {
  border: '1px solid black',
  width: '90%',
};

export class DataRepoHandler implements IList, IAddItem, IUpdateItem {
  filterName = 'Document filter';
  itemName = 'Documents';
  //private model: MMELModel;
  private store: DocumentStore;
  private reg: MMELRegistry | null;
  private setAddMode: (b: boolean) => void;
  private updating: DocumentItem | null;
  private data: DocumentItem;
  private setData: (x: DocumentItem) => void;
  private forceUpdate: () => void;
  private setUpdateMode: (b: boolean) => void;
  private setUpdateDoc: (x: DocumentItem) => void;

  constructor(
    model: MMELModel,
    store: DocumentStore,
    reg: MMELRegistry | null,
    updateObj: DocumentItem | null,
    setAdd: (b: boolean) => void,
    setUpdate: (b: boolean) => void,
    setUpdateDoc: (x: DocumentItem) => void,
    forceUpdate: () => void,
    data: DocumentItem,
    setDoc: (x: DocumentItem) => void
  ) {
    //this.model = model;
    this.store = store;
    this.reg = reg;
    this.updating = updateObj;
    this.setAddMode = setAdd;
    this.setUpdateMode = setUpdate;
    this.forceUpdate = forceUpdate;
    this.setUpdateDoc = setUpdateDoc;
    this.data = data;
    this.setData = setDoc;
  }

  getItems = (): Array<DocumentListItem> => {
    const out: Array<DocumentListItem> = [];
    if (this.reg !== null) {
      const repo = this.store.get(this.reg);
      repo.docs.forEach((v, k) => {
        out.push(new DocumentListItem('' + k, descDocument(v), '' + k));
      });
    }
    return out;
  };

  addItemClicked = () => {
    if (this.reg !== null) {
      this.data = this.store.get(this.reg).createNewDocument();
      this.setData({ ...this.data });
      this.setAddMode(true);
    }
  };

  removeItem = (refs: Array<string>) => {
    if (this.reg !== null) {
      const repo = this.store.get(this.reg);
      refs.map(x => {
        repo.docs.delete(parseInt(x));
      });
      this.forceUpdate();
    }
  };

  updateItem = (ref: string) => {
    const x = parseInt(ref);
    if (!isNaN(x) && this.reg !== null) {
      const repo = this.store.get(this.reg);
      const r = repo.get(x);
      this.data.id = r.id;
      this.data.meta = r.meta;
      this.data.attributes = r.attributes;
      this.setData({ ...this.data });
      this.setUpdateDoc(r);
      this.setUpdateMode(true);
    }
  };

  private getFields = (): Array<JSX.Element> => {
    const elms: Array<JSX.Element> = [];
    if (this.reg !== null && this.reg.data !== null) {
      elms.push(
        <NormalTextField
          key={'field#metadata'}
          text={'Document description'}
          value={this.data.meta}
          update={(x: string) => {
            this.data.meta = x;
            this.setData({ ...this.data });
          }}
        />
      );
      this.enumerateDataClass('', this.reg.data, elms);
    }
    return elms;
  };

  getAddFields = (): Array<JSX.Element> => {
    return this.getFields();
  };

  addClicked = () => {
    if (this.reg !== null) {
      const repo = this.store.get(this.reg);
      repo.docs.set(this.data.id, this.data);
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
    if (this.updating !== null && this.reg !== null) {
      const repo = this.store.get(this.reg);
      if (this.data.id !== this.updating.id) {
        repo.docs.delete(this.updating.id);
        repo.docs.set(this.data.id, this.data);
        this.setUpdateMode(false);
      }
    }
  };

  updateCancel = () => {
    this.setUpdateMode(false);
  };

  private enumerateDataClass(
    prefix: string,
    dc: MMELDataClass,
    elms: Array<JSX.Element>
  ) {
    const roleoptions: Array<string> = [];
    functionCollection
      .getStateMan()
      .state.modelWrapper.model.roles.forEach(r => {
        roleoptions.push(r.id);
      });

    dc.attributes.map(a => {
      const value = getAttributeValue(this.data, a.id);
      if (a.type === STRINGTYPE || a.type === EMPTYTYPE) {
        elms.push(
          <NormalTextField
            key={'field#' + prefix + a.id}
            text={a.definition}
            value={value}
            update={(x: string) => {
              this.data.attributes.set(a.id, x);
              this.setData({ ...this.data });
            }}
          />
        );
      } else if (a.type === BOOLEANTYPE) {
        elms.push(
          <NormalComboBox
            key={'field#' + prefix + a.id}
            text={a.definition}
            value={value}
            options={BOOLEANOPTIONS}
            update={(x: string) => {
              this.data.attributes.set(a.id, x);
              this.setData({ ...this.data });
            }}
          />
        );
      } else if (a.type === ROLETYPE) {
        elms.push(
          <ReferenceSelector
            key={'field#' + prefix + a.id}
            text={a.definition}
            filterName={'Role filter'}
            value={getAttributeValue(this.data, a.id)}
            options={roleoptions}
            update={(x: number) => {
              if (x !== -1) {
                this.data.attributes.set(a.id, roleoptions[x]);
                this.setData({ ...this.data });
              }
            }}
          />
        );
      } else if (a.type === DATETIMETYPE) {
        elms.push(
          <DataTimeTextField
            key={'field#' + prefix + a.id}
            text={a.definition}
            value={value}
            update={(x: string) => {
              this.data.attributes.set(a.id, x);
              this.setData({ ...this.data });
            }}
          />
        );
      } else {
        const mw = functionCollection.getStateMan().state.modelWrapper;
        const u = a.type.indexOf('(');
        const v = a.type.indexOf(')');
        if (u !== -1 && v !== -1) {
          const type = a.type.substr(u + 1, v - u - 1);
          const opts: Array<string> = [];
          const obj = mw.idman.nodes.get(type);
          if (obj?.datatype === DataType.DATACLASS) {
            const r = obj as MMELDataClass;
            const mother = mw.dlman.get(r).mother;
            if (mother !== null) {
              this.store.get(mother).docs.forEach(d => {
                opts.push(descDocument(d));
              });
              elms.push(
                <ReferenceSelector
                  key={'field#' + prefix + a.id}
                  text={a.definition}
                  filterName={type + ' filter'}
                  value={getAttributeValue(this.data, a.id)}
                  options={opts}
                  update={(x: number) => {
                    if (x !== -1) {
                      this.data.attributes.set(a.id, opts[x]);
                      this.setData({ ...this.data });
                    }
                  }}
                />
              );
            }
          }
        } else {
          // the data type is a data class
          const obj = mw.idman.nodes.get(a.type);
          if (obj?.datatype === DataType.DATACLASS) {
            const d = obj as MMELDataClass;
            const childelms: Array<JSX.Element> = [];
            this.enumerateDataClass(prefix + '#' + a.id, d, childelms);
            elms.push(
              <div
                key={'field#container#' + prefix + a.id}
                style={containercss}
              >
                {' '}
                <p key={'field#containertext#' + prefix + a.id}>
                  {a.definition}
                </p>{' '}
                {childelms}{' '}
              </div>
            );
          } else if (obj?.datatype === DataType.ENUM) {
            const d = obj as MMELEnum;
            const opts: Array<string> = [];
            d.values.map(v => {
              opts.push(v.value);
            });
            elms.push(
              <NormalComboBox
                key={'field#' + prefix + a.id}
                text={a.definition}
                options={opts}
                value={getAttributeValue(this.data, a.id)}
                update={(x: string) => {
                  this.data.attributes.set(a.id, x);
                  this.setData({ ...this.data });
                }}
              />
            );
          }
        }
      }
    });
  }
}

function getAttributeValue(doc: DocumentItem, x: string) {
  let y = doc.attributes.get(x);
  if (y === undefined) {
    y = '';
  }
  return y;
}

function descDocument(doc: DocumentItem): string {
  return doc.meta + ' (' + doc.id + ')';
}

export class DocumentListItem implements IListItem {
  id: string;
  text = '';
  reference: string;

  constructor(a: string, b: string, c: string) {
    this.id = a;
    this.text = b;
    this.reference = c;
  }
}
