import React, { useState } from 'react';
import {
  IManageHandler,
  IUpdateInterface,
  IViewListInterface,
} from '../fields';
import ItemUpdatePane from '@/smart/ui/common/listmanagement/itemupdate';
import ListViewPane from '@/smart/ui/common/listmanagement/listview';
import { IObject } from '@/smart/ui/common/listmanagement/listPopoverItem';

export enum ListManagePageType {
  VIEW = 'view',
  ADD = 'add',
  UPDATE = 'update',
}

const ListManagePage = <T extends IObject | undefined>(props: IManageHandler<T>) => {
  const {
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
    moveUp,
    moveDown,
  } = props;

  const [selected, setSelected] = useState<T>(initObj);
  const [oldid, setOldId] = useState<string>('');

  const [mode, setMode] = useState<ListManagePageType>(ListManagePageType.VIEW);

  const addHandler: IUpdateInterface<T> = {
    isVisible         : mode === ListManagePageType.ADD,
    Content           : Content,
    object            : selected,
    model             : model,
    setObject         : setSelected,
    updateButtonLabel : 'Add',
    updateButtonIcon  : 'plus',
    updateClicked     : () => {
      if (addItem(selected)) {
        setMode(ListManagePageType.VIEW);
      }
    },
    cancelClicked : () => {
      setMode(ListManagePageType.VIEW);
    },
    oldid,
  };

  const updateHandler: IUpdateInterface<T> = {
    isVisible         : mode === ListManagePageType.UPDATE,
    Content           : Content,
    object            : selected,
    model             : model,
    setObject         : setSelected,
    updateButtonLabel : 'Update',
    updateButtonIcon  : 'edit',
    updateClicked     : () => {
      if (updateItem(oldid, selected)) {
        setMode(ListManagePageType.VIEW);
      }
    },
    cancelClicked : () => {
      setMode(ListManagePageType.VIEW);
    },
    oldid,
  };

  const viewHandler: IViewListInterface = {
    isVisible  : mode === ListManagePageType.VIEW,
    filterName,
    itemName,
    getItems,
    removeItems,
    moveUp,
    moveDown,
    addClicked : () => {
      setSelected({ ...initObj });
      setMode(ListManagePageType.ADD);
    },
    updateClicked : (selected: string) => {
      setOldId(selected);
      setSelected({ ...getObjById(selected) });
      setMode(ListManagePageType.UPDATE);
    },
    size    : 15,
    buttons : buttons,
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
