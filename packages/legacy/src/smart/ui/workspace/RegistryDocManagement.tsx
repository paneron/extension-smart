import React from 'react';
import { EditorModel } from '@/smart/model/editormodel';
import { itemSorterByText } from '@/smart/utils/ModelFunctions';
import {
  IAdditionalListButton,
  IListItem,
  IManageHandler,
} from '@/smart/ui/common/fields';
import ListManagePage from '@/smart/ui/common/listmanagement/listmanagement';
import { SMARTDocument, SMARTDocumentStore } from '@/smart/model/workspace';
import DocumentEdit, { DocumentEditInterface } from '@/smart/ui/workspace/DocumentEditor';

import { isNotUndefined } from '@/lib/typeHelpers';

const RegistryDocManagement: React.FC<{
  model: EditorModel;
  store: SMARTDocumentStore;
  regid: string;
  setStore: (s: SMARTDocumentStore) => void;
  onBack?: () => void;
  workspace: Record<string, SMARTDocumentStore>;
}> = function ({ model, store, regid, setStore, onBack, workspace }) {
  const initObj: DocumentEditInterface = {
    id         : '0',
    name       : 'New item',
    attributes : {},
    regid      : regid,
  };

  function matchFilter(doc: SMARTDocument, filter: string) {
    return filter === '' || doc.name.toLowerCase().includes(filter);
  }

  function getDocListItems(filter: string): IListItem[] {
    return Object.values(store.docs)
      .filter(isNotUndefined)
      .filter(x => matchFilter(x, filter))
      .map(x => ({ id : `${x.id}`, text : x.name }))
      .sort(itemSorterByText);
  }

  function removeDocListItem(ids: string[]) {
    for (const sid of ids) {
      const id = parseInt(sid);
      delete store.docs[id];
    }
    setStore({ ...store });
  }

  function addDoc(doc: SMARTDocument): boolean {
    const id = genNewID(store.docs);
    doc.id = '' + id;
    store.docs[id] = doc;
    setStore({ ...store });
    return true;
  }

  function updateDoc(oldid: string, doc: SMARTDocument): boolean {
    const id = parseInt(oldid);
    store.docs[id] = doc;
    setStore({ ...store });
    return true;
  }

  function getDocById(sid: string): DocumentEditInterface {
    const id = parseInt(sid);
    const doc = store.docs[id];
    if (isNotUndefined(doc)) {
      return { ...doc, regid };
    } else {
      return { ...initObj };
    }
  }

  const backButton: IAdditionalListButton | undefined =
    onBack === undefined
      ? undefined
      : {
        text            : 'Back',
        icon            : 'arrow-left',
        requireSelected : false,
        onClick         : onBack,
      };

  const CallbackDocumentEdit: React.FC<{
    object: DocumentEditInterface;
    setObject: (obj: DocumentEditInterface) => void;
  }> = function ({ object, setObject }) {
    return (
      <DocumentEdit
        doc={object}
        model={model}
        setDoc={x => setObject(x)}
        workspace={workspace}
      />
    );
  };

  const reghandler: IManageHandler<DocumentEditInterface> = {
    filterName  : 'Date item filter',
    itemName    : 'Data items',
    Content     : CallbackDocumentEdit,
    initObj     : { ...initObj },
    model       : model,
    getItems    : getDocListItems,
    removeItems : removeDocListItem,
    addItem     : obj => addDoc(cleanDocument(obj)),
    updateItem  : (oldid, obj) => updateDoc(oldid, cleanDocument(obj)),
    getObjById  : getDocById,
    buttons     : backButton === undefined ? undefined : [backButton],
  };

  return <ListManagePage {...reghandler} />;
};

function genNewID(record: Record<number, SMARTDocument | undefined>): number {
  let id = 0;
  do {
    id = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
  } while (record[id] !== undefined);
  return id;
}

function cleanDocument(xdoc: DocumentEditInterface): SMARTDocument {
  return {
    id         : xdoc.id,
    name       : xdoc.name,
    attributes : xdoc.attributes,
  };
}

export default RegistryDocManagement;
