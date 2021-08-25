/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { jsx } from '@emotion/react';
import React, { useState } from 'react';
import {
  IManageHandler,
  IUpdateInterface,
  IViewListInterface,
} from '../fields';
import ItemUpdatePane from './itemupdate';
import ListViewPane from './listview';

export enum ListManagePageType {
  VIEW = 'view',
  ADD = 'add',
  UPDATE = 'update',
}

const ListManagePage: React.FC<IManageHandler> = ({
  filterName,
  itemName,
  Content,
  initObj,
  model,
  getItems,
  removeItems,
  addItem,
  updateItem,
  getObjById,
  buttons,
}) => {
  const [selected, setSelected] = useState<Object>(initObj);
  const [oldid, setOldId] = useState<string>('');

  const [mode, setMode] = useState<ListManagePageType>(ListManagePageType.VIEW);

  const addHandler: IUpdateInterface = {
    isVisible: mode === ListManagePageType.ADD,
    Content: Content,
    object: selected,
    model: model,
    setObject: setSelected,
    updateButtonLabel: 'Add',
    updateButtonIcon: 'plus',
    updateClicked: () => {
      if (addItem(selected)) {
        setMode(ListManagePageType.VIEW);
      }
    },
    cancelClicked: () => {
      setMode(ListManagePageType.VIEW);
    },
  };

  const updateHandler: IUpdateInterface = {
    isVisible: mode === ListManagePageType.UPDATE,
    Content: Content,
    object: selected,
    model: model,
    setObject: setSelected,
    updateButtonLabel: 'Update',
    updateButtonIcon: 'edit',
    updateClicked: () => {
      if (updateItem(oldid, selected)) {
        setMode(ListManagePageType.VIEW);
      }
    },
    cancelClicked: () => {
      setMode(ListManagePageType.VIEW);
    },
  };

  const viewHandler: IViewListInterface = {
    isVisible: mode === ListManagePageType.VIEW,
    filterName: filterName,
    itemName: itemName,
    getItems: getItems,
    removeItems: removeItems,
    addClicked: () => {
      setSelected({ ...initObj });
      setMode(ListManagePageType.ADD);
    },
    updateClicked: selected => {
      setOldId(selected);
      setSelected({ ...getObjById(selected) });
      setMode(ListManagePageType.UPDATE);
    },
    size: 15,
    buttons: buttons,
  };  

  return (
    <>
      <ListViewPane {...viewHandler} />
      <ItemUpdatePane {...addHandler} />
      <ItemUpdatePane {...updateHandler} />
    </>
  );
};

export default ListManagePage;
