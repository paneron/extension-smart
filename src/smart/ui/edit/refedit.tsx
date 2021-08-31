/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { FormGroup } from '@blueprintjs/core';
import { jsx } from '@emotion/react';
import React from 'react';
import {
  EditorModel,
  isEditorApproval,
  isEditorDataClass,
} from '../../model/editormodel';
import { MMELReference } from '../../serialize/interface/supportinterface';
import {
  checkId,
  referenceSorter,
  replaceSet,
  toRefSummary,
} from '../../utils/ModelFunctions';
import { createReference } from '../../utils/EditorFactory';
import { IListItem, IManageHandler, NormalTextField } from '../common/fields';
import ListManagePage from '../common/listmanagement/listmanagement';

const ReferenceEditPage: React.FC<{
  model: EditorModel;
  setModel: (model: EditorModel) => void;
}> = function ({ model, setModel }) {
  function matchFilter(ref: MMELReference, filter: string) {
    return (
      filter === '' ||
      ref.id.toLowerCase().includes(filter) ||
      ref.document.toLowerCase().includes(filter) ||
      ref.clause.toLowerCase().includes(filter)
    );
  }

  function getRefListItems(filter: string): IListItem[] {
    return Object.values(model.refs)
      .filter(x => matchFilter(x, filter))
      .sort(referenceSorter)
      .map(x => ({ id: x.id, text: toRefSummary(x) }));
  }

  function replaceReferences(matchid: string, replaceid: string) {
    for (const p in model.provisions) {
      replaceSet(model.provisions[p].ref, matchid, replaceid);
    }
    for (const a in model.elements) {
      const elm = model.elements[a];
      if (isEditorApproval(elm)) {
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

  function addRef(ref: MMELReference): boolean {
    if (ref.clause.includes(',')) {
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
      setModel(model);
      return true;
    } else {
      if (checkId(ref.id, model.refs)) {
        model.refs[ref.id] = ref;
        setModel(model);
        return true;
      }
    }
    return false;
  }

  function updateRef(oldid: string, ref: MMELReference): boolean {
    if (oldid !== ref.id) {
      if (checkId(ref.id, model.refs)) {
        delete model.refs[oldid];
        model.refs[ref.id] = ref;
        replaceReferences(oldid, ref.id);
        setModel(model);
        return true;
      }
      return false;
    } else {
      model.refs[oldid] = ref;
      setModel(model);
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

  const refhandler: IManageHandler = {
    filterName: 'Reference filter',
    itemName: 'References',
    Content: ReferenceEditItemPage,
    initObj: createReference(''),
    model: model,
    getItems: getRefListItems,
    removeItems: removeRefListItem,
    addItem: obj => addRef(obj as MMELReference),
    updateItem: (oldid, obj) => updateRef(oldid, obj as MMELReference),
    getObjById: getRefById,
  };

  return <ListManagePage {...refhandler} />;
};

const ReferenceEditItemPage: React.FC<{
  object: Object;
  setObject: (obj: Object) => void;
}> = ({ object, setObject }) => {
  const ref = object as MMELReference;
  return (
    <FormGroup>
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
        onChange={(x: string) => {
          ref.id = x.replaceAll(/\s+/g, '');
          setObject({ ...ref });
        }}
      />
      <NormalTextField
        key="field#document"
        text="Document"
        value={ref.document}
        onChange={(x: string) => {
          ref.document = x;
          setObject({ ...ref });
        }}
      />
      <NormalTextField
        key="field#clause"
        text="Clause"
        value={ref.clause}
        onChange={(x: string) => {
          ref.clause = x;
          setObject({ ...ref });
        }}
      />
      <NormalTextField
        key="field#title"
        text="Title"
        value={ref.title}
        onChange={(x: string) => {
          ref.title = x;
          setObject({ ...ref });
        }}
      />
    </FormGroup>
  );
};

export default ReferenceEditPage;
