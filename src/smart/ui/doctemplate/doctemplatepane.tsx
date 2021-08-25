/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { Dialog, FormGroup } from '@blueprintjs/core';
import { jsx, css } from '@emotion/react';
import React, { useState } from 'react';
import { EditorModel } from '../../model/editormodel';
import { checkId, defaultItemSorter } from '../../utils/commonfunctions';
import {
  IAdditionalListButton,
  IListItem,
  IManageHandler,
  NormalTextField,
} from '../common/fields';
import ListManagePage from '../common/listmanagement/listmanagement';
import { MappingDoc, MapProfile } from '../mapper/mapmodel';
import ReportGen from './reportgen';

const DocTemplatePane: React.FC<{
  mapProfile: MapProfile;
  setMapProfile: (mp: MapProfile) => void;
  refModel: EditorModel;
  impModel: EditorModel;
}> = function ({ mapProfile, setMapProfile, refModel, impModel }) {
  const [genDocId, setGenDocId] = useState<string | null>(null);

  function matchFilter(doc: MappingDoc, filter: string) {
    return filter === '' || doc.title.toLowerCase().indexOf(filter) !== -1;
  }

  function getDocListItems(filter: string): IListItem[] {
    return Object.values(mapProfile.docs)
      .filter(x => matchFilter(x, filter))
      .map(x => ({ id: x.id, text: x.title }))
      .sort(defaultItemSorter);
  }

  function removeDocListItem(ids: string[]) {
    for (const id of ids) {
      delete mapProfile.docs[id];
    }
    setMapProfile({ ...mapProfile });
  }

  function addDoc(doc: MappingDoc): boolean {
    if (checkId(doc.id, mapProfile.docs)) {
      mapProfile.docs[doc.id] = doc;
      setMapProfile({ ...mapProfile });
      return true;
    }
    return false;
  }

  function updateDoc(oldid: string, doc: MappingDoc): boolean {
    if (oldid !== doc.id) {
      if (checkId(doc.id, mapProfile.docs)) {
        delete mapProfile.docs[oldid];
        mapProfile.docs[doc.id] = doc;
        setMapProfile({ ...mapProfile });
        return true;
      }
      return false;
    } else {
      mapProfile.docs[oldid] = doc;
      setMapProfile({ ...mapProfile });
      return true;
    }
  }

  function getDocById(id: string): MappingDoc {
    const doc = mapProfile.docs[id];
    if (doc === undefined) {
      return {
        id: '',
        title: '',
        content: '',
      };
    }
    return doc;
  }

  function genReport(id: string) {
    setGenDocId(id);
  }

  const genButtonProps: IAdditionalListButton = {
    text: 'Generate',
    icon: 'build',
    onClick: genReport,
  };

  const dochandler: IManageHandler = {
    filterName: 'Template filter',
    itemName: 'Templates',
    Content: DocEditItemPage,
    initObj: {
      id: '',
      title: '',
      content: '',
    },
    getItems: getDocListItems,
    removeItems: removeDocListItem,
    addItem: obj => addDoc(obj as MappingDoc),
    updateItem: (oldid, obj) => updateDoc(oldid, obj as MappingDoc),
    getObjById: getDocById,
    buttons: [genButtonProps],
  };

  return (
    <FormGroup>
      <ListManagePage {...dochandler} />
      <Dialog
        isOpen={genDocId !== null}
        title={'Report'}
        css={css`
          width: calc(100vw - 60px);
          min-height: calc(100vh - 60px);
          padding-bottom: 0;
          & > :last-child {
            overflow-y: auto;
            padding: 20px;
          }
        `}
        onClose={() => setGenDocId(null)}
        canEscapeKeyClose={false}
        canOutsideClickClose={false}
      >
        <ReportGen
          mapProfile={mapProfile}
          selected={genDocId ?? ''}
          refModel={refModel}
          impModel={impModel}
          onClose={() => setGenDocId(null)}
        />
      </Dialog>
    </FormGroup>
  );
};

const DocEditItemPage: React.FC<{
  object: Object;
  setObject: (obj: Object) => void;
}> = ({ object, setObject }) => {
  const doc = object as MappingDoc;
  return (
    <FormGroup>
      <NormalTextField
        key="field#docid"
        text="Document ID"
        value={doc.id}
        onChange={(x: string) => {
          doc.id = x.replaceAll(/\s+/g, '');
          setObject({ ...doc });
        }}
      />
      <NormalTextField
        key="field#doctitle"
        text="Document title"
        value={doc.title}
        onChange={(x: string) => {
          doc.title = x;
          setObject({ ...doc });
        }}
      />
      <NormalTextField
        key="field#doccontent"
        text="Document Content"
        rows={30}
        value={doc.content}
        onChange={(x: string) => {
          doc.content = x;
          setObject({ ...doc });
        }}
      />
    </FormGroup>
  );
};

export default DocTemplatePane;