/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { Dialog } from '@blueprintjs/core';
import { jsx, css } from '@emotion/react';
import React, { useState } from 'react';
import { EditorModel } from '../../../model/editormodel';
import { MMELObject } from '../../../serialize/interface/baseinterface';
import { checkId, defaultItemSorter } from '../../../utils/commonfunctions';
import { IListItem, IUpdateInterface, IViewListInterface } from '../fields';
import ItemUpdatePane from './itemupdate';
import ListViewPane from './listview';

export type IObject = MMELObject & {
  id: string;
};

export interface PopListInterface {
  items: Record<string, IObject>;
  setItems: (x: Record<string, IObject>) => void;
  model: EditorModel;
  initObject: IObject;
  matchFilter: (x: IObject, filter: string) => boolean;
  getListItem?: (x: IObject) => IListItem;
  Content: React.FC<{
    object: MMELObject;
    model: EditorModel;
    setObject: (obj: MMELObject) => void;
  }>;
  label: string;
}

function defaultGetListItem(x: IObject): IListItem {
  return {
    id: x.id,
    text: x.id,
  };
}

const ListWithPopoverItem: React.FC<PopListInterface> = function ({
  items,
  setItems,
  model,
  initObject,
  matchFilter,
  getListItem = defaultGetListItem,
  Content,
  label,
}) {
  const [editing, setEditing] = useState<IObject>(initObject);
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
    filterName: 'Attribute filter',
    itemName: '',
    getItems: getItems,
    removeItems: removeItem,
    addClicked: addClicked,
    updateClicked: updateClicked,
    size: 10,
  };

  function addItem(x: IObject): boolean {
    if (checkId(x.id, items)) {
      items[x.id] = { ...x };
      setItems({ ...items });
      return true;
    }
    return false;
  }

  function updateItem(oldId: string, x: IObject): boolean {
    if (oldId !== x.id) {
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

  const addHandler: IUpdateInterface = {
    Content: Content,
    object: editing,
    model: model,
    setObject: x => setEditing(x as IObject),
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
    Content: Content,
    object: editing,
    model: model,
    setObject: x => setEditing(x as IObject),
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
        <legend>{label}:</legend>
        <ListViewPane {...viewHandler} />
      </fieldset>
    </>
  );
};

export default ListWithPopoverItem;
