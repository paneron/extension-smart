/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { Dialog } from '@blueprintjs/core';
import { jsx, css } from '@emotion/react';
import React, { useState } from 'react';
import { EditorModel } from '../../model/editormodel';
import { MMELObject } from '../../serialize/interface/baseinterface';
import { MMELEnumValue } from '../../serialize/interface/datainterface';
import { checkId } from '../../utils/commonfunctions';
import { createEnumValue } from '../../utils/EditorFactory';
import {
  IListItem,
  IUpdateInterface,
  IViewListInterface,
  NormalTextField,
} from '../common/fields';
import ItemUpdatePane from '../common/listmanagement/itemupdate';
import ListViewPane from '../common/listmanagement/listview';

const EnumValueEditPage: React.FC<{
  values: Record<string, MMELEnumValue>;
  model: EditorModel;
  setValues: (x: Record<string, MMELEnumValue>) => void;
}> = ({ values, model, setValues }) => {
  const [editing, setEditing] = useState<MMELEnumValue>(createEnumValue(''));
  const [oldId, setOldId] = useState<string>('');
  const [mode, setMode] = useState<'Add' | 'Update' | 'None'>('None');

  function matchFilter(x: MMELEnumValue, filter: string) {
    return filter === '' || x.id.toLowerCase().indexOf(filter) !== -1;
  }

  function getValues(filter: string): IListItem[] {
    return Object.values(values)
      .filter(x => matchFilter(x, filter))
      .map(x => ({ id: x.id, text: x.id }))
      .sort((a, b) => a.id.localeCompare(b.id));
  }

  function removeValueListItem(ids: string[]) {
    for (const id of ids) {
      delete values[id];
    }
    setValues(values);
  }

  function addClicked() {
    setEditing(createEnumValue(''));
    setMode('Add');
  }

  function updateClicked(id: string) {
    setEditing({ ...values[id] });
    setOldId(id);
    setMode('Update');
  }

  const viewHandler: IViewListInterface = {
    filterName: 'Enumeration value filter',
    itemName: '',
    getItems: getValues,
    removeItems: removeValueListItem,
    addClicked: addClicked,
    updateClicked: updateClicked,
    size: 10,
  };

  function addItem(x: MMELEnumValue): boolean {
    if (checkId(x.id, values)) {
      values[x.id] = { ...x };
      setValues(values);
      return true;
    }
    return false;
  }

  function updateItem(oldId: string, x: MMELEnumValue): boolean {
    if (oldId !== x.id) {
      if (checkId(x.id, values)) {
        delete values[oldId];
        values[x.id] = { ...x };
        setValues(values);
        return true;
      }
      return false;
    } else {
      values[oldId] = { ...x };
      setValues(values);
      return true;
    }
  }

  const addHandler: IUpdateInterface = {
    Content: EnumValueItem,
    object: editing,
    model: model,
    setObject: x => setEditing(x as MMELEnumValue),
    updateButtonLabel: 'Add',
    updateButtonIcon: 'plus',
    updateClicked: () => {
      if (addItem(editing)) {
        setMode('None');
      }
    },
    cancelClicked: () => {
      setMode('None');
    },
  };

  const updateHandler: IUpdateInterface = {
    Content: EnumValueItem,
    object: editing,
    model: model,
    setObject: x => setEditing(x as MMELEnumValue),
    updateButtonLabel: 'Update',
    updateButtonIcon: 'edit',
    updateClicked: () => {
      if (updateItem(oldId, editing)) {
        setMode('None');
      }
    },
    cancelClicked: () => {
      setMode('None');
    },
  };

  const addPane = <ItemUpdatePane {...addHandler} />;
  const updatePane = <ItemUpdatePane {...updateHandler} />;

  return (
    <>
      <Dialog
        isOpen={mode !== 'None'}
        title="Attribute details"
        css={css`
          width: calc(100vw - 60px);
          padding-bottom: 0;
          & > :last-child {
            overflow-y: auto;
            padding: 20px;
          }
        `}
        onClose={() => setMode('None')}
        canEscapeKeyClose={false}
        canOutsideClickClose={false}
      >
        {mode === 'Add' ? addPane : updatePane}
      </Dialog>
      <fieldset>
        <legend>Enumeration values:</legend>
        <ListViewPane {...viewHandler} />
      </fieldset>
    </>
  );
};

const EnumValueItem: React.FC<{
  object: MMELObject;
  model: EditorModel;
  setObject: (obj: MMELObject) => void;
}> = ({ object, setObject }) => {
  const ev = object as MMELEnumValue;

  return (
    <>
      <NormalTextField
        key="field#valueid"
        text="Enumeration item ID"
        value={ev.id}
        onChange={x => {
          ev.id = x.replaceAll(/\s+/g, '');
          setObject({ ...ev });
        }}
      />
      <NormalTextField
        key="field#valuecontent"
        text="Enumeration item value"
        value={ev.value}
        onChange={x => {
          ev.value = x;
          setObject({ ...ev });
        }}
      />
    </>
  );
};

export default EnumValueEditPage;
