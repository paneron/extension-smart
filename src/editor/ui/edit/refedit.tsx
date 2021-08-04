/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { jsx } from '@emotion/react';
import React from 'react';
import {
  EditorModel,
  isEditorAppproval,
  isEditorDataClass,
} from '../../model/editormodel';
import { MMELObject } from '../../serialize/interface/baseinterface';
import { MMELReference } from '../../serialize/interface/supportinterface';
import { replaceSet, toRefSummary } from '../../utils/commonfunctions';
import { createReference } from '../../utils/EditorFactory';
import { IListItem, IManageHandler, NormalTextField } from '../common/fields';
import ListManagePage from '../common/listmanagement/listmanagement';

const ReferenceEditPage: React.FC<{
  model: EditorModel;
  setModel: (model: EditorModel) => void;
}> = function ({ model, setModel }) {
  function getRefListItems(filter: string): IListItem[] {
    const smallfilter = filter.toLowerCase();
    const out: IListItem[] = [];
    for (const r in model.refs) {
      const ref = model.refs[r];
      if (
        smallfilter === '' ||
        ref.id.toLowerCase().indexOf(smallfilter) !== -1 ||
        ref.document.toLowerCase().indexOf(smallfilter) !== -1 ||
        ref.clause.toLowerCase().indexOf(smallfilter) !== -1
      ) {
        out.push({
          id: ref.id,
          text: toRefSummary(ref),
        });
      }
    }
    return out;
  }

  function replaceReferences(matchid: string, replaceid: string) {
    for (const p in model.provisions) {
      replaceSet(model.provisions[p].ref, matchid, replaceid);
    }
    for (const a in model.elements) {
      const elm = model.elements[a];
      if (isEditorAppproval(elm)) {
        replaceSet(elm.ref, matchid, replaceid);
      } else if (isEditorDataClass(elm)) {
        for (const x in elm.attributes) {
          replaceSet(elm.attributes[x].ref, matchid, replaceid);
        }
      }
    }
  }

  function removeRefListItem(ids: string[]) {
    for (const id of ids) {
      delete model.refs[id];
      replaceReferences(id, '');
    }
    setModel(model);
  }

  function checkId(id: string): boolean {
    if (id === '') {
      alert('New ID is empty');
      return false;
    }
    if (model.refs[id] !== undefined) {
      alert('New ID already exists');
      return false;
    }
    return true;
  }

  function addRef(ref: MMELReference): boolean {
    if (ref.clause.indexOf(',') !== -1) {
      const failed: string[] = [];
      const clauses = ref.clause.split(',');
      for (let c of clauses) {
        c = c.trim();
        const id = ref.id + c.replaceAll('.', '-');
        if (model.refs[id] === undefined) {
          const newref = createReference(id);
          newref.document = ref.document;
          newref.clause = c;
          model.refs[id] = newref;
        } else {
          failed.push(c);
        }
      }
      if (failed.length > 0) {
        alert(
          'The following clauses cannot be added because their IDs already exist: ' +
            failed.join(', ')
        );
        return false;
      }
      return true;
    } else {
      if (checkId(ref.id)) {
        model.refs[ref.id] = ref;
        return true;
      }
    }
    return false;
  }

  function updateRef(oldid: string, ref: MMELReference): boolean {
    if (oldid !== ref.id) {
      if (checkId(ref.id)) {
        delete model.refs[oldid];
        model.refs[ref.id] = ref;
        replaceReferences(oldid, ref.id);
        return true;
      }
      return false;
    } else {
      model.refs[oldid] = ref;
      return true;
    }
  }

  function getRefById(id: string): MMELReference {
    const ref = model.refs[id];
    if (ref === undefined) {
      return createReference('');
    }
    return ref;
  }

  const rolehandler: IManageHandler = {
    filterName: 'Reference filter',
    itemName: 'References',
    Content: ReferenceEditItemPage,
    initObj: createReference(''),
    getItems: getRefListItems,
    removeItems: removeRefListItem,
    addItem: obj => addRef(obj as MMELReference),
    updateItem: (oldid, obj) => updateRef(oldid, obj as MMELReference),
    getObjById: getRefById,
  };

  return <ListManagePage {...rolehandler} />;
};

const ReferenceEditItemPage: React.FC<{
  object: MMELObject;
  setObject: (obj: MMELObject) => void;
}> = ({ object, setObject }) => {
  const ref = object as MMELReference;
  return (
    <>
      <p>
        You may insert multiple clauses at once. Seperate the cluase by ",". IDs
        of the references will be automatically generated according to the
        clause numbers. For example, clause 4.1.1 with ID "ref" will become
        "ref4-1-1".
      </p>
      <NormalTextField
        key="field#refid"
        text="Reference ID"
        value={ref.id}
        update={(x: string) => {
          ref.id = x.replaceAll(/\s+/g, '');
          setObject({ ...ref });
        }}
      />
      <NormalTextField
        key="field#document"
        text="Document"
        value={ref.document}
        update={(x: string) => {
          ref.document = x;
          setObject({ ...ref });
        }}
      />
      <NormalTextField
        key="field#clause"
        text="Clause"
        value={ref.clause}
        update={(x: string) => {
          ref.clause = x;
          setObject({ ...ref });
        }}
      />
    </>
  );
};

export default ReferenceEditPage;
