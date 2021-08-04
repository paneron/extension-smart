/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { jsx } from '@emotion/react';
import React, { useState } from 'react';
import { MMELObject } from '../../../serialize/interface/baseinterface';
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
  getItems,
  removeItems,
  addItem,
  updateItem,
  getObjById,
}) => {
  const [selected, setSelected] = useState<MMELObject>(initObj);
  const [oldid, setOldId] = useState<string>('');

  const [mode, setMode] = useState<ListManagePageType>(ListManagePageType.VIEW);

  const addHandler: IUpdateInterface = {
    Content: Content,
    object: selected,
    setObject: setSelected,
    updateButtonLabel: 'Add',
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
    Content: Content,
    object: selected,
    setObject: setSelected,
    updateButtonLabel: 'Update',
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
  };

  const ActionPage: Record<ListManagePageType, JSX.Element> = {
    [ListManagePageType.VIEW]: <ListViewPane {...viewHandler} />,
    [ListManagePageType.ADD]: <ItemUpdatePane {...addHandler} />,
    [ListManagePageType.UPDATE]: <ItemUpdatePane {...updateHandler} />,
  };

  const page = ActionPage[mode];

  return <>{page}</>;
};

export default ListManagePage;
