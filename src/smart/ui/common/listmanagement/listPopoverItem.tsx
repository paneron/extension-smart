/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { Dialog } from '@blueprintjs/core';
import { jsx } from '@emotion/react';
import React, { useState } from 'react';
import { dialog_layout } from '../../../../css/layout';
import { EditorModel } from '../../../model/editormodel';
import { MMELObject } from '../../../serialize/interface/baseinterface';
import {
  checkId,
  defaultItemSorter,
  findUniqueID,
} from '../../../utils/ModelFunctions';
import { IListItem, IUpdateInterface, IViewListInterface } from '../fields';
import ItemUpdatePane from './itemupdate';
import ListViewPane from './listview';

export type IObject = MMELObject & {
  id: string;
};

export interface PopListInterface<T> {
  items: Record<string, T>;
  setItems: (x: Record<string, T>) => void;
  model?: EditorModel;
  initObject: T;
  matchFilter: (x: T, filter: string) => boolean;
  filterName: string;
  getListItem?: (x: T) => IListItem;
  Content: React.FC<{
    object: T;
    model?: EditorModel;
    setObject: (obj: T) => void;
  }>;
  label: string;
  size?: number;
  requireUniqueId?: boolean;
}

function defaultGetListItem(x: IObject): IListItem {
  return {
    id: x.id,
    text: x.id,
  };
}

const ListWithPopoverItem = <T extends IObject>(props: PopListInterface<T>) => {
  const {
    items,
    setItems,
    model,
    initObject,
    matchFilter,
    filterName,
    getListItem = defaultGetListItem,
    Content,
    label,
    size = 10,
    requireUniqueId = true,
  } = props;
  const [editing, setEditing] = useState<T>(initObject);
  const [oldId, setOldId] = useState<string>('');
  const [mode, setMode] = useState<'Add' | 'Update' | 'None'>('None');

  function getItems(filter: string): IListItem[] {
    return Object.values(items)
      .filter(x => matchFilter(x, filter))
      .map(x => getListItem(x))
      .sort(defaultItemSorter);
  }

  function removeItem(ids: string[]) {
    for (const id of ids) {
      delete items[id];
    }
    setItems(items);
  }

  function addClicked() {
    setEditing(initObject);
    setMode('Add');
  }

  function updateClicked(id: string) {
    setEditing({ ...items[id] });
    setOldId(id);
    setMode('Update');
  }

  const viewHandler: IViewListInterface = {
    isVisible: true,
    filterName: filterName,
    itemName: '',
    getItems: getItems,
    removeItems: removeItem,
    addClicked: addClicked,
    updateClicked: updateClicked,
    size: size,
  };

  function addItem(x: T): boolean {
    if (!requireUniqueId) {
      x.id = findUniqueID('object', items);
    }
    if (checkId(x.id, items)) {
      items[x.id] = { ...x };
      setItems({ ...items });
      return true;
    }
    return false;
  }

  function updateItem(oldId: string, x: T): boolean {
    if (oldId !== x.id) {
      if (!requireUniqueId) {
        x.id = findUniqueID('object', items);
      }
      if (checkId(x.id, items)) {
        delete items[oldId];
        items[x.id] = { ...x };
        setItems({ ...items });
        return true;
      }
      return false;
    } else {
      items[oldId] = { ...x };
      setItems({ ...items });
      return true;
    }
  }

  const addHandler: IUpdateInterface<T> = {
    isVisible: mode === 'Add',
    Content: Content,
    object: editing,
    model: model,
    setObject: x => setEditing(x),
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

  const updateHandler: IUpdateInterface<T> = {
    isVisible: mode === 'Update',
    Content: Content,
    object: editing,
    model: model,
    setObject: x => setEditing(x),
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

  return (
    <>
      <Dialog
        isOpen={mode !== 'None'}
        title="Attribute details"
        css={dialog_layout}
        onClose={() => setMode('None')}
        canEscapeKeyClose={false}
        canOutsideClickClose={false}
      >
        <ItemUpdatePane {...addHandler} />
        <ItemUpdatePane {...updateHandler} />
      </Dialog>
      <fieldset>
        <legend>{label}:</legend>
        <ListViewPane {...viewHandler} />
      </fieldset>
    </>
  );
};

export default ListWithPopoverItem;
